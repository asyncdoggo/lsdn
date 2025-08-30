import { useEffect, useRef, useState } from "react";
import { History } from "../utils/history";
import type { TextToImageGenerator } from "../textToImageGenerator";
import { setBaseUrl as setBaseUrlInManager } from "../core/modelManager";

export default function ActionSection({ settings, setSettings, setBaseUrl, generator, setLoadingText, canvasRef }: { settings: any, setSettings: any, setBaseUrl: (model: string) => void, generator: TextToImageGenerator | null, setLoadingText: (text: string | undefined) => void, canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
    const historyObject = useRef(History.getInstance());
    const historyRef = useRef<HTMLSelectElement | null>(null);

    const [btnStates, setBtnStates] = useState({
        generate: false,
        stop: true,
        download: true
    });

    const clearHistory = async () => {
        historyObject.current.clear();
        if (historyRef.current) {
            historyRef.current.value = '';
        }
        historyRef.current!.innerHTML = '<option value="">History</option>';
    };

    const updateHistory = async () => {
        const fullHistory = await historyObject.current.getEntries();
        historyRef.current!.innerHTML = '<option value="">History</option>';

        fullHistory.forEach(entry => {
            const option = document.createElement('option');
            option.value = entry.id;
            option.textContent = `${entry.options.prompt.slice(0, 30)}... (${new Date(entry.timestamp).toLocaleTimeString()})`;
            historyRef.current!.appendChild(option);
        });
    };

    // Load history when a selection is made
    const onHistoryChange = async (event: React.ChangeEvent<HTMLSelectElement>) => {
        const selectedId = event.target.value;
        if (!selectedId) return;

        const entry = await historyObject.current.getEntry(selectedId);
        if (!entry) return;

        // Restore all settings from history
        setSettings({
            prompt: entry.options.prompt,
            negativePrompt: entry.options.negativePrompt || '',
            steps: entry.options.steps,
            guidance: entry.options.guidance,
            scheduler: entry.options.scheduler || 'euler-karras',
            seed: entry.options.seed || '',
            useTiledVAE: entry.options.useTiledVAE || false,
            lowMemoryMode: entry.options.lowMemoryMode || false,
            randomize: entry.options.randomize || false,
            width: entry.options.width,
            height: entry.options.height,
            tileSize: entry.options.tileSize,
            model: entry.options.model || 'subpixel/small-stable-diffusion-v0-onnx-ort-web',
            previewUrl: entry.previewUrl || ''
        })

        setBaseUrl(entry.options.model || 'subpixel/small-stable-diffusion-v0-onnx-ort-web');
        setBaseUrlInManager(entry.options.model || 'subpixel/small-stable-diffusion-v0-onnx-ort-web');
        event.target.value = ''; // Reset selection
    };


    const generateImage = async () => {
        if (!generator) return;
        if (!("gpu" in navigator)) {
            alert('GPU is needed to run. Please use a compatible browser with WebGPU support.');
            return;
        }

        if (btnStates.generate) {
            return; // Prevent multiple clicks
        }

        setBtnStates({
            generate: true,
            stop: false,
            download: true
        });


        if (settings.prompt.trim() === '') {
            alert('Please enter a text prompt');
            setBtnStates({
                generate: false,
                stop: true,
                download: false
            });
            return;
        }

        let actualSeed: number = settings.seed;
        if (settings.randomize) {
            actualSeed = Math.floor(Math.random() * 0xFFFFFFFF);
        }

        if (isNaN(actualSeed) || actualSeed < 0) {
            actualSeed = Math.floor(Math.random() * 0xFFFFFFFF);
        }

        setSettings({ ...settings, seed: actualSeed });

        const historyId = await historyObject.current.addEntry(settings);
        updateHistory()

        try {
            const result = await generator.generateImage(
                settings,
                (stage: string, progress: number) => {
                    setLoadingText(`${stage} (${Math.round(progress * 100)}%)`);
                },
                (previewImageData: ImageData) => {
                    const canvas = canvasRef.current;
                    if (!canvas) return;

                    // Update canvas with preview during generation
                    const ctx = canvas.getContext('2d');
                    if (ctx) {
                        // Set canvas to match preview image size
                        canvas.width = previewImageData.width;
                        canvas.height = previewImageData.height;

                        // Clear the canvas explicitly
                        ctx.clearRect(0, 0, canvas.width, canvas.height);

                        // Draw the preview
                        ctx.putImageData(previewImageData, 0, 0);

                        // Scale canvas display size while maintaining aspect ratio
                        canvas.style.width = `${settings.width}px`;
                        canvas.style.height = `${settings.height}px`;
                        // Use smooth scaling for preview
                        canvas.style.imageRendering = 'auto';
                    }
                }
            );
            try {
                const ctx = canvasRef.current?.getContext('2d');
                if (ctx && result) {
                    canvasRef.current!.width = result.width;
                    canvasRef.current!.height = result.height;
                    ctx.putImageData(result, 0, 0);

                    // Update history entry with final image
                    const previewUrl = canvasRef.current?.toDataURL('image/png') || '';
                    historyObject.current.updateEntry(historyId, { previewUrl });
                    updateHistory();
                }
            } catch (error) {
                console.error('Error updating history entry:', error);
                alert('Error updating history entry with preview image.');
            }
            

        } catch (error) {
            console.error('Error generating image:', error);
        } finally {
            setBtnStates({
                generate: false,
                stop: true,
                download: false
            });

            // TODO: Handle clearCache disabling

            setLoadingText(undefined);
        }
    }

    const stopGeneration = async () => {
        if (!generator) return;
        setBtnStates((prev) => ({
            ...prev,
            stop: true
        }));
        generator.cancelGeneration();
    };

    const downloadImage = async () => {
        if (!generator) return;
        const prompt = settings.prompt.trim().slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
        const filename = `ai-generated-${prompt}-${Date.now()}.png`;
        const link = document.createElement('a');
        link.download = filename;
        link.href = canvasRef.current?.toDataURL('image/png') || '';
        link.click();
    };

    useEffect(() => {
        updateHistory();
    }, []);

    return (
        <div className="action-section">
            <div className="history-controls">
                <select id="history" className="history-select" onChange={onHistoryChange} ref={historyRef}>
                    <option value="">History</option>
                </select>
                <button id="clearHistory" title="Clear History" className="clear-history-btn" type="button" onClick={clearHistory}>
                    <span className="btn-icon">🗑️</span>
                </button>
            </div>
            <div className="action-buttons">
                <button id="generate" className="generate-btn" type="button" disabled={btnStates.generate} onClick={generateImage}>
                    <span className="btn-icon">✨</span>
                    <span className="btn-text">{btnStates.generate ? 'Generating...' : 'Generate'}</span>
                </button>
                <button id="stop" className="stop-btn" type="button" disabled={btnStates.stop} onClick={stopGeneration}>
                    <span className="btn-icon">⏹️</span>
                    <span className="btn-text">
                        {
                            generator?.isGenerating
                                ? (btnStates.stop ? 'Stopping...' : 'Stop')
                                : 'Stop'
                        }
                    </span>
                </button>
                <button id="download" className="download-btn" type="button" disabled={btnStates.download} onClick={downloadImage}>
                    <span className="btn-icon">💾</span>
                    <span className="btn-text">Download</span>
                </button>
            </div>
        </div>
    )
}
