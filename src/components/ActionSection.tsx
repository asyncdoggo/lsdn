import { useEffect, useRef, useState } from "react";
import { History } from "../utils/history";
import type { TextToImageGenerator } from "../textToImageGenerator";
import HistorySection from "./HistorySection";

export default function ActionSection({ settings, setSettings, setBaseUrl, generator, setLoadingText, canvasRef }: { settings: any, setSettings: any, setBaseUrl: (model: string) => void, generator: TextToImageGenerator | null, setLoadingText: (text: string | undefined) => void, canvasRef: React.RefObject<HTMLCanvasElement | null> }) {
    const historyObject = useRef(History.getInstance());
    const [historyEntries, setHistoryEntries] = useState<any[]>([]);
    const [showHistoryGrid, setShowHistoryGrid] = useState(false);

    const [btnStates, setBtnStates] = useState({
        generate: false,
        stop: true,
        download: true
    });



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
        settings.seed = actualSeed; // Update settings with actual seed

        setSettings({ ...settings, seed: actualSeed });

        const historyId = await historyObject.current.addEntry(settings);
        updateHistoryEntries();

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
                    updateHistoryEntries();
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

    const updateHistoryEntries = async () => {
        const fullHistory = await historyObject.current.getEntries();
        setHistoryEntries(fullHistory);
    };

    useEffect(() => {
        updateHistoryEntries();
    }, []);

    return (
        <div className="action-section">
            <HistorySection
                historyObject={historyObject}
                historyEntries={historyEntries}
                setHistoryEntries={setHistoryEntries}
                showHistoryGrid={showHistoryGrid}
                setShowHistoryGrid={setShowHistoryGrid}
                updateHistoryEntries={updateHistoryEntries}
                setSettings={setSettings}
                setBaseUrl={setBaseUrl}
            />

            {/* Action Buttons */}
            <div className="action-buttons-section border-t border-[rgba(255,255,255,0.1)] pt-4">
                <div className="action-buttons flex flex-col gap-3 mb-3">
                    <button
                        id="generate"
                        className="generate-btn relative flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-[var(--color-success)] to-[var(--color-success)] hover:from-[var(--color-success)] hover:to-[var(--color-success)] disabled:from-[var(--color-success)] disabled:to-[var(--color-success)] disabled:opacity-60 disabled:cursor-not-allowed text-[var(--color-text-primary)] font-semibold text-base rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:shadow-none backdrop-blur-[10px] overflow-hidden"
                        type="button"
                        disabled={btnStates.generate}
                        onClick={generateImage}
                        title="Generate Image"
                    >
                        <span className="btn-icon text-lg">{btnStates.generate ? '⏳' : '✨'}</span>
                        <span className="btn-text font-semibold">
                            {btnStates.generate ? 'Generating...' : 'Generate'}
                        </span>
                    </button>

                    <button
                        id="stop"
                        className="stop-btn relative flex items-center justify-center gap-2 p-3 bg-gradient-to-r from-red-500 to-red-600 hover:from-red-400 hover:to-red-500 disabled:from-red-600 disabled:to-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-[var(--color-text-primary)] font-semibold text-base rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:shadow-none backdrop-blur-[10px] overflow-hidden"
                        type="button"
                        disabled={btnStates.stop}
                        onClick={stopGeneration}
                        title="Stop Generation"
                    >
                        <span className="btn-icon text-lg">⏹️</span>
                        <span className="btn-text font-semibold">
                            {generator?.isGenerating
                                ? (btnStates.stop ? 'Stopping...' : 'Stop')
                                : 'Stop'
                            }
                        </span>
                    </button>

                    <button
                        id="download"
                        className="download-btn relative flex items-center justify-center gap-2 p-3 bg-[rgba(255,255,255,0.1)] hover:bg-[rgba(255,255,255,0.2)] disabled:bg-[rgba(255,255,255,0.1)] disabled:opacity-50 disabled:cursor-not-allowed text-[rgba(255,255,255,0.8)] hover:text-[var(--color-text-primary)] font-semibold text-base rounded-lg cursor-pointer transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-lg disabled:transform-none disabled:shadow-none border-2 border-[rgba(255,255,255,0.2)] hover:border-[rgba(255,255,255,0.3)] backdrop-blur-[10px] overflow-hidden"
                        type="button"
                        disabled={btnStates.download}
                        onClick={downloadImage}
                        title="Download Image"
                    >
                        <span className="btn-icon text-lg">💾</span>
                        <span className="btn-text font-semibold">Download</span>
                    </button>
                </div>
            </div>
        </div>
    )
}
