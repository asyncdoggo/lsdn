import * as ort from 'onnxruntime-web/webgpu';

export class ClipProcessor {
    constructor() {
        // Initialization code here
    }

    /**
     * Supports: (text:1.2), ((text)), [text], (text), etc.
     */
    parsePrompt(prompt: string): { text: string; weight: number }[] {
        // Enhanced regex to handle nested brackets and multiple formats
        const regex = /(\({2,}[^)]+\){2,}|\[[^\]]+\]|\([^)]+\))/g;
        let parts: { text: string; weight: number }[] = [];
        let lastIndex = 0;

        for (const match of prompt.matchAll(regex)) {
            // Add unweighted text before this match
            if (match.index! > lastIndex) {
                const unweightedText = prompt.slice(lastIndex, match.index).trim();
                if (unweightedText) {
                    parts.push({ text: unweightedText, weight: 1.0 });
                }
            }

            let token = match[0];
            let weight = 1.0;
            let text = '';

            if (token.startsWith('((') && token.endsWith('))')) {
                // Multiple parentheses: ((word)) = 1.21, (((word))) = 1.331, etc.
                const openCount = (token.match(/^\(+/)?.[0] || '').length;
                text = token.slice(openCount, -openCount);
                weight = Math.pow(1.1, openCount);
            } else if (token.startsWith('(') && token.endsWith(')')) {
                const inner = token.slice(1, -1);
                if (inner.includes(':')) {
                    // Explicit weight: (word:1.2)
                    const colonIndex = inner.lastIndexOf(':');
                    text = inner.slice(0, colonIndex);
                    const weightStr = inner.slice(colonIndex + 1);
                    weight = parseFloat(weightStr) || 1.0;
                } else {
                    // Single parentheses: (word) = 1.1
                    text = inner;
                    weight = 1.1;
                }
            } else if (token.startsWith('[') && token.endsWith(']')) {
                // Square brackets: [word] = 0.9
                text = token.slice(1, -1);
                weight = 0.9;
            }

            if (text.trim()) {
                parts.push({ text: text.trim(), weight });
            }

            lastIndex = match.index! + token.length;
        }

        // Add remaining unweighted text
        if (lastIndex < prompt.length) {
            const remainingText = prompt.slice(lastIndex).trim();
            if (remainingText) {
                parts.push({ text: remainingText, weight: 1.0 });
            }
        }

        return parts;
    }


    /**
    * Finds exact token positions for weighted parts and applies ComfyUI/A111-like scaling
    * with RMS normalization so small weights (0.1 vs 0.01) remain distinguishable.
    */
    async getWeightedEmbedding(tokenizer: any, text_encoder: any, prompt: string): Promise<ort.Tensor> {
        const parts = this.parsePrompt(prompt);

        // Full prompt text (without weights, just text pieces joined)
        const fullPrompt = parts.map(p => p.text).join(" ").replace(/\s+/g, " ").trim() || "";

        // --- 1) Encode full (unweighted) ---
        const fullInputs = await tokenizer(fullPrompt, {
            padding: true,
            max_length: 77,
            truncation: true,
            return_tensor: false
        });

        const fullOut = await text_encoder.sess.run({
            input_ids: new ort.Tensor('int32', fullInputs.input_ids, [1, fullInputs.input_ids.length])
        });

        const fullLast = fullOut.last_hidden_state;
        const fullArr = new Float32Array(fullLast.data);
        const dims = fullLast.dims;              // [1, seqLen, embDim]
        const seqLen = dims[dims.length - 2];
        const embDim = dims[dims.length - 1];

        // Fast path: no weights at all
        if (parts.every(p => p.weight === 1.0)) return fullLast;

        // --- 2) Encode empty/unconditional ---
        const emptyInputs = await tokenizer("", {
            padding: true,
            max_length: 77,
            truncation: true,
            return_tensor: false
        });

        const emptyOut = await text_encoder.sess.run({
            input_ids: new ort.Tensor('int32', emptyInputs.input_ids, [1, emptyInputs.input_ids.length])
        });

        const emptyArr = new Float32Array(emptyOut.last_hidden_state.data);

        // --- 3) Build token→weight map ---
        const weights = new Float32Array(seqLen).fill(1.0);

        // Helper: multiply weights across a token span
        const applyRangeWeight = (start: number, length: number, w: number) => {
            for (let t = 0; t < length; t++) {
                if (start + t < seqLen) weights[start + t] *= w;
            }
        };

        // Match each weighted part’s tokens in the full prompt
        for (const part of parts) {
            const raw = (part.text || "").trim();
            if (!raw || part.weight === 1.0) continue;

            const pInputs = await tokenizer(raw, {
                padding: false,
                max_length: 77,
                truncation: true,
                return_tensor: false
            });

            // Remove BOS/EOS if present
            let pTokens = pInputs.input_ids.slice();
            if (pTokens.length >= 2) pTokens = pTokens.slice(1, pTokens.length - 1);

            if (pTokens.length === 0) continue;

            const fullIds = fullInputs.input_ids;

            for (let i = 1; i + pTokens.length - 1 < fullIds.length; i++) {
                let match = true;
                for (let j = 0; j < pTokens.length; j++) {
                    if (fullIds[i + j] !== pTokens[j]) {
                        match = false;
                        break;
                    }
                }
                if (match) applyRangeWeight(i, pTokens.length, part.weight);
            }
        }

        // --- 4) Interpolate between empty and full for each token ---
        const finalArr = new Float32Array(fullArr.length);

        for (let tok = 0; tok < seqLen; tok++) {
            const w = weights[tok];
            const off = tok * embDim;

            for (let d = 0; d < embDim; d++) {
                const u = fullArr[off + d]; // unweighted
                const e = emptyArr[off + d]; // empty
                finalArr[off + d] = e + (u - e) * w;
            }
        }

        // --- 5) RMS re-normalize embeddings (preserves prompt strength) ---
        let sumSqFull = 0, sumSqWeighted = 0, count = 0;
        for (let i = 0; i < finalArr.length; i++) {
            sumSqFull += fullArr[i] * fullArr[i];
            sumSqWeighted += finalArr[i] * finalArr[i];
            count++;
        }

        const rmsFull = Math.sqrt(sumSqFull / count);
        const rmsWeighted = Math.sqrt(sumSqWeighted / count);
        const scale = rmsWeighted > 0 ? (rmsFull / rmsWeighted) : 1.0;

        for (let i = 0; i < finalArr.length; i++) {
            finalArr[i] *= scale;
        }

        return new ort.Tensor('float32', finalArr, fullLast.dims);
    }


}
