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
     * Finds exact token positions for weighted parts and applies direction-based scaling
     */
    async getWeightedEmbedding(tokenizer: any, text_encoder: any, prompt: string): Promise<ort.Tensor> {
        const parts = this.parsePrompt(prompt);
        
        if (parts.every(p => p.weight === 1.0)) {
            // No weighting needed, use standard path
            const inputs = await tokenizer(prompt, { 
                padding: true, 
                max_length: 77, 
                truncation: true, 
                return_tensor: false 
            });
            
            return await text_encoder.sess.run({
                input_ids: new ort.Tensor('int32', inputs.input_ids, [1, inputs.input_ids.length])
            }).then((result: any) => result.last_hidden_state);
        }

        // Step 1: Get empty embedding baseline
        const emptyInputs = await tokenizer('', { 
            padding: true, 
            max_length: 77, 
            truncation: true, 
            return_tensor: false 
        });
        
        const emptyResult = await text_encoder.sess.run({
            input_ids: new ort.Tensor('int32', emptyInputs.input_ids, [1, emptyInputs.input_ids.length])
        });
        const emptyEmbedding = new Float32Array(emptyResult.last_hidden_state.data);

        // Step 2: Process each weighted part individually to find exact token mappings
        const tokenWeightMap = new Map<number, number>();
        
        for (const part of parts) {
            if (!part.text.trim() || part.weight === 1.0) continue;
            
            // Tokenize just this part to see its tokens
            const partInputs = await tokenizer(part.text.trim(), { 
                padding: false, 
                max_length: 77, 
                truncation: true, 
                return_tensor: false 
            });
            
            // Also tokenize the full prompt to find where these tokens appear
            const fullPrompt = parts.map(p => p.text).join(' ');
            const fullInputs = await tokenizer(fullPrompt, { 
                padding: true, 
                max_length: 77, 
                truncation: true, 
                return_tensor: false 
            });
            
            
            // Find where the part tokens appear in the full sequence
            const partTokens = partInputs.input_ids.slice(1, -1); // Remove BOS/EOS
            for (let i = 1; i < fullInputs.input_ids.length - 1; i++) {
                for (let j = 0; j < partTokens.length; j++) {
                    if (i + j < fullInputs.input_ids.length && 
                        fullInputs.input_ids[i + j] === partTokens[j]) {
                        if (j === partTokens.length - 1) {
                            // Found complete match, apply weight to all tokens in this sequence
                            for (let k = 0; k < partTokens.length; k++) {
                                tokenWeightMap.set(i - j + k, part.weight);
                            }
                        }
                    } else {
                        break;
                    }
                }
            }
        }

        // Step 3: Get unweighted embedding for full prompt
        const fullPrompt = parts.map(p => p.text).join(' ');
        const inputs = await tokenizer(fullPrompt, { 
            padding: true, 
            max_length: 77, 
            truncation: true, 
            return_tensor: false 
        });

        const result = await text_encoder.sess.run({
            input_ids: new ort.Tensor('int32', inputs.input_ids, [1, inputs.input_ids.length])
        });
        
        const unweightedEmbedding = new Float32Array(result.last_hidden_state.data);
        
        const embeddingDim = 768;
        const seqLen = Math.min(77, inputs.input_ids.length);
        const finalEmbedding = new Float32Array(unweightedEmbedding.length);
        
        let weightsApplied = 0;
        for (let tokenIdx = 0; tokenIdx < seqLen; tokenIdx++) {
            const weight = tokenWeightMap.get(tokenIdx) || 1.0;
            const startIdx = tokenIdx * embeddingDim;
            
            if (weight !== 1.0) {
                weightsApplied++;
            }
            
            for (let dim = 0; dim < embeddingDim; dim++) {
                const idx = startIdx + dim;
                const emptyValue = emptyEmbedding[idx] || 0;
                const unweightedValue = unweightedEmbedding[idx];
                
                const direction = unweightedValue - emptyValue;
                finalEmbedding[idx] = emptyValue + (direction * weight);
            }
        }
        
        return new ort.Tensor('float32', finalEmbedding, result.last_hidden_state.dims);
    }


}
