import { useEffect } from "react";
import { History } from "../utils/history";
import { setBaseUrl as setBaseUrlInManager } from "../core/modelManager";

interface HistorySectionProps {
    historyObject: React.RefObject<History>;
    historyEntries: any[];
    setHistoryEntries: React.Dispatch<React.SetStateAction<any[]>>;
    showHistoryGrid: boolean;
    setShowHistoryGrid: React.Dispatch<React.SetStateAction<boolean>>;
    updateHistoryEntries: () => Promise<void>;
    setSettings: any;
    setBaseUrl: (model: string) => void;
}

export default function HistorySection({
    historyObject,
    historyEntries,
    showHistoryGrid,
    setShowHistoryGrid,
    updateHistoryEntries,
    setSettings,
    setBaseUrl
}: HistorySectionProps) {
    const clearHistory = async () => {
        historyObject.current.clear();
        updateHistoryEntries();
    };

    const loadHistoryEntry = async (entry: any) => {
        setSettings({
            prompt: entry.options.prompt,
            negativePrompt: entry.options.negativePrompt || '',
            steps: entry.options.steps,
            guidance: entry.options.guidance,
            scheduler: entry.options.scheduler || 'euler-karras',
            seed: entry.options.seed,
            useTiledVAE: entry.options.useTiledVAE || false,
            lowMemoryMode: entry.options.lowMemoryMode || false,
            randomize: entry.options.randomize || false,
            width: entry.options.width,
            height: entry.options.height,
            tileSize: entry.options.tileSize,
            model: entry.options.model || 'subpixel/small-stable-diffusion-v0-onnx-ort-web',
            previewUrl: entry.previewUrl || ''
        });

        setBaseUrl(entry.options.model || 'subpixel/small-stable-diffusion-v0-onnx-ort-web');
        setBaseUrlInManager(entry.options.model || 'subpixel/small-stable-diffusion-v0-onnx-ort-web');
        setShowHistoryGrid(false);
    };

    useEffect(() => {
        updateHistoryEntries();
    }, []);

    return (
        <div className="history-section my-4">
            <div className="history-header flex items-center justify-between mb-3 gap-2">
                <button
                    className="history-toggle-btn flex-1 flex items-center justify-between p-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg text-[rgba(255,255,255,0.8)] font-medium text-sm cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.1)] hover:border-[rgba(255,255,255,0.15)] transform hover:-translate-y-0.5 hover:shadow-md backdrop-blur-[10px]"
                    onClick={() => setShowHistoryGrid(!showHistoryGrid)}
                    title="Toggle History Thumbnails"
                >
                    <span className="btn-icon text-lg">🖼️</span>
                    <span className="btn-text flex-1 text-left ml-2">History ({historyEntries.length})</span>
                    <span className={`toggle-icon text-sm text-gray-400 transition-all duration-300 ${showHistoryGrid ? 'expanded rotate-180 text-[var(--color-accent-primary)]' : ''}`}>▼</span>
                </button>
                <button
                    className="clear-history-btn p-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[rgba(255,255,255,0.8)] cursor-pointer transition-all duration-300 hover:bg-red-600 hover:border-red-500 transform hover:-translate-y-0.5 hover:shadow-md backdrop-blur-[10px]"
                    title="Clear History (Ctrl+Shift+Del)"
                    onClick={clearHistory}
                >
                    <span className="btn-icon text-base">🗑️</span>
                </button>
            </div>

            {showHistoryGrid && (
                <div className="history-grid grid grid-cols-2 sm:grid-cols-3 gap-3 p-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-lg backdrop-blur-[10px] max-h-96 overflow-y-auto scrollbar-thin scrollbar-thumb-[rgba(255,255,255,0.2)] scrollbar-track-transparent">
                    {historyEntries.length === 0 ? (
                        <div className="empty-history col-span-full flex flex-col items-center justify-center p-6 text-center text-gray-400">
                            <span className="empty-icon text-3xl mb-2">📭</span>
                            <p className="text-sm text-gray-300 m-0 mb-1">No history yet</p>
                            <small className="text-xs text-gray-500">Generated images will appear here</small>
                        </div>
                    ) : (
                        historyEntries.map((entry) => (
                            <div
                                key={entry.id}
                                className="history-item flex flex-col bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.1)] rounded-md cursor-pointer transition-all duration-300 hover:bg-[rgba(255,255,255,0.15)] hover:border-[var(--color-accent-primary)] transform hover:-translate-y-1 hover:shadow-lg overflow-hidden"
                                onClick={() => loadHistoryEntry(entry)}
                                title={`${entry.options.prompt.slice(0, 50)}...`}
                            >
                                <div className="history-thumbnail w-full h-20 bg-gray-700 flex items-center justify-center overflow-hidden">
                                    {entry.previewUrl ? (
                                        <img
                                            src={entry.previewUrl}
                                            alt="Generated image"
                                            loading="lazy"
                                            className="w-full h-full object-cover transition-all duration-300 hover:scale-105"
                                        />
                                    ) : (
                                        <div className="placeholder-thumbnail w-full h-full flex items-center justify-center bg-gray-700 text-xl">
                                            <span>🖼️</span>
                                        </div>
                                    )}
                                </div>
                                <div className="history-info p-2 bg-[rgba(255,255,255,0.05)]">
                                    <div className="history-prompt text-xs text-[var(--color-text-primary)] font-medium mb-1 line-clamp-2 leading-tight">
                                        {entry.options.prompt.slice(0, 25)}...
                                    </div>
                                    <div className="history-meta text-xs text-gray-400">
                                        {new Date(entry.timestamp).toLocaleTimeString()}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
