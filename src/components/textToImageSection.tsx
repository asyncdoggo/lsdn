import { useState } from 'react';
import { setBaseUrl } from "../core/modelManager";
import type { TextToImageGenerator } from "../textToImageGenerator";

export default function TextToImageSection({settings, setSettings, generator}: {settings: any, setSettings: any, generator: TextToImageGenerator | null}) {
    const [expandedSections, setExpandedSections] = useState({
        prompts: true,
        generation: true,
        advanced: false,
        model: true
    });

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const clearModelCache = () => {
        const confirm = window.confirm("Are you sure you want to clear the model cache?");
        if (confirm) {
            generator?.clearCache();
        }
    };

    return (
        <div className="text-to-image-section flex flex-col">
            {/* Prompts Section */}
            <div className="settings-section mb-4 border border-[rgba(255,255,255,0.05)] rounded-lg bg-[var(--color-bg-secondary)] backdrop-blur-[10px] overflow-hidden">
                <div className="section-header flex items-center justify-between p-3 bg-[var(--color-bg-primary)] border-b border-[rgba(255,255,255,0.05)] cursor-pointer transition-all duration-300 hover:bg-[var(--color-bg-primary)]" onClick={() => toggleSection('prompts')}>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] m-0">Text Prompts</h3>
                    <span className={`toggle-icon text-sm text-gray-400 transition-all duration-300 ${expandedSections.prompts ? 'expanded rotate-180 text-[var(--color-accent-primary)]' : ''}`}>▼</span>
                </div>
                {expandedSections.prompts && (
                    <div className="section-content p-4">
                        <div className="prompt-group mb-4">
                            <label htmlFor="promptInput" className="prompt-label positive flex items-center gap-2 text-sm font-medium mb-2 text-green-400">
                                <span className="label-icon text-lg">✨</span>
                                Positive Prompt
                            </label>
                            <textarea
                                id="promptInput"
                                placeholder="Describe what you want to see... (e.g., 'a beautiful sunset over mountains, photorealistic')"
                                rows={3}
                                maxLength={500}
                                value={settings.prompt}
                                onChange={(e) => setSettings({...settings, prompt: e.target.value})}
                                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[var(--color-text-primary)] font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-[var(--color-accent-primary)] focus:bg-[rgba(255,255,255,0.1)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.3)]"
                            />
                            <div className="char-count text-right text-xs text-gray-400 mt-1">{settings.prompt.length}/500</div>
                        </div>
                        <div className="prompt-group">
                            <label htmlFor="negativePromptInput" className="prompt-label negative flex items-center gap-2 text-sm font-medium mb-2 text-red-400">
                                <span className="label-icon text-lg">🚫</span>
                                Negative Prompt
                            </label>
                            <textarea
                                id="negativePromptInput"
                                placeholder="Describe what you don't want... (e.g., 'blurry, low quality, distorted')"
                                rows={2}
                                maxLength={300}
                                value={settings.negativePrompt}
                                onChange={(e) => setSettings({...settings, negativePrompt: e.target.value})}
                                className="w-full p-3 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[var(--color-text-primary)] font-inherit text-sm resize-vertical transition-all duration-300 focus:outline-none focus:border-[var(--color-accent-primary)] focus:bg-[rgba(255,255,255,0.1)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.3)]"
                            />
                            <div className="char-count text-right text-xs text-gray-400 mt-1">{settings.negativePrompt.length}/300</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Generation Settings */}
            <div className="settings-section mb-4 border border-[rgba(255,255,255,0.05)] rounded-lg bg-[var(--color-bg-secondary)] backdrop-blur-[10px] overflow-hidden">
                <div className="section-header flex items-center justify-between p-3 bg-[var(--color-bg-primary)] border-b border-[rgba(255,255,255,0.05)] cursor-pointer transition-all duration-300 hover:bg-[var(--color-bg-primary)]" onClick={() => toggleSection('generation')}>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] m-0">Generation Settings</h3>
                    <span className={`toggle-icon text-sm text-gray-400 transition-all duration-300 ${expandedSections.generation ? 'expanded rotate-180 text-[var(--color-accent-primary)]' : ''}`}>▼</span>
                </div>
                {expandedSections.generation && (
                    <div className="section-content p-4">
                        <div className="settings-grid grid grid-cols-2 gap-4">
                            <div className="setting-group flex flex-col gap-1">
                                <label title="Number of denoising steps" className="text-sm text-[rgba(255,255,255,0.8)] font-medium">Steps: <span className="value-display text-[var(--color-accent-primary)] font-semibold">{settings.steps}</span></label>
                                <input type="range" id="stepsSlider" min="1" max="50" value={settings.steps} onChange={(e) => setSettings({...settings, steps: parseInt(e.target.value)})} className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-sm outline-none appearance-none slider-thumb:bg-[var(--color-accent-primary)] slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:cursor-pointer" />
                            </div>
                            <div className="setting-group flex flex-col gap-1">
                                <label title="How strongly the AI should follow the prompt" className="text-sm text-[rgba(255,255,255,0.8)] font-medium">Guidance: <span className="value-display text-[var(--color-accent-primary)] font-semibold">{settings.guidance}</span></label>
                                <input type="range" id="guidanceSlider" min="1" max="15" step="0.5" value={settings.guidance} onChange={(e) => setSettings({...settings, guidance: parseFloat(e.target.value)})} className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-sm outline-none appearance-none slider-thumb:bg-[var(--color-accent-primary)] slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:cursor-pointer" />
                            </div>
                            <div className="setting-group full-width col-span-2">
                                <label htmlFor="schedulerSelect" className="text-sm text-[rgba(255,255,255,0.8)] font-medium">Scheduler:</label>
                                <select id="schedulerSelect" value={settings.scheduler} onChange={(e) => setSettings({...settings, scheduler: e.target.value})} className="w-full p-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[var(--color-text-primary)] text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.3)] relative z-50">
                                    <optgroup label="Euler Method" className="bg-gray-800 text-[var(--color-text-primary)]">
                                        <option value="euler-karras" className="bg-gray-800 text-[var(--color-text-primary)]">Euler (Karras)</option>
                                        <option value="euler-linear" className="bg-gray-800 text-[var(--color-text-primary)]">Euler (Linear)</option>
                                        <option value="euler-exponential" className="bg-gray-800 text-[var(--color-text-primary)]">Euler (Exponential)</option>
                                    </optgroup>
                                    <optgroup label="DPM++ 2M SDE" className="bg-gray-800 text-[var(--color-text-primary)]">
                                        <option value="dpmpp-2m-sde-karras" className="bg-gray-800 text-[var(--color-text-primary)]">DPM++ 2M SDE (Karras)</option>
                                        <option value="dpmpp-2m-sde-linear" className="bg-gray-800 text-[var(--color-text-primary)]">DPM++ 2M SDE (Linear)</option>
                                        <option value="dpmpp-2m-sde-exponential" className="bg-gray-800 text-[var(--color-text-primary)]">DPM++ 2M SDE (Exponential)</option>
                                    </optgroup>
                                    <optgroup label="Other Methods" className="bg-gray-800 text-[var(--color-text-primary)]">
                                        <option value="ddpm" className="bg-gray-800 text-[var(--color-text-primary)]">DDPM</option>
                                        <option value="lms" className="bg-gray-800 text-[var(--color-text-primary)]">LMS (Linear Multi-Step)</option>
                                        <option value="heun" className="bg-gray-800 text-[var(--color-text-primary)]">Heun (2nd Order)</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced Settings */}
            <div className="settings-section mb-4 border border-[rgba(255,255,255,0.05)] rounded-lg bg-[var(--color-bg-secondary)] backdrop-blur-[10px] overflow-hidden">
                <div className="section-header flex items-center justify-between p-3 bg-[var(--color-bg-primary)] border-b border-[rgba(255,255,255,0.05)] cursor-pointer transition-all duration-300 hover:bg-[var(--color-bg-primary)]" onClick={() => toggleSection('advanced')}>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] m-0">Advanced Settings</h3>
                    <span className={`toggle-icon text-sm text-gray-400 transition-all duration-300 ${expandedSections.advanced ? 'expanded rotate-180 text-[var(--color-accent-primary)]' : ''}`}>▼</span>
                </div>
                {expandedSections.advanced && (
                    <div className="section-content p-4">
                        <div className="settings-grid grid grid-cols-1 gap-4">
                            <div className="setting-group full-width">
                                <label id="seedLabel" htmlFor="seedInput" className="text-sm text-[rgba(255,255,255,0.8)] font-medium">Seed:</label>
                                <div className="seed-controls flex items-center gap-3 mt-2">
                                    <input type="number" id="seedInput" placeholder="Random" min="0" max="999999" value={settings.seed} onChange={(e) => setSettings({...settings, seed: parseInt(e.target.value)})} className="flex-1 p-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[var(--color-text-primary)] text-sm transition-all duration-300 focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.3)]" />
                                    <label className="checkbox-label flex items-center gap-2 cursor-pointer text-sm text-[rgba(255,255,255,0.8)] user-select-none">
                                        <input type="checkbox" checked={settings.randomize} onChange={(e) => setSettings({...settings, randomize: e.target.checked})} className="hidden" />
                                        <span className="checkmark w-4 h-4 border-2 border-[rgba(255,255,255,0.2)] rounded-sm relative transition-all duration-300 flex items-center justify-center">
                                            {settings.randomize && <span className="text-xs text-white font-bold">✓</span>}
                                        </span>
                                        Randomize
                                    </label>
                                </div>
                            </div>
                            <div className="setting-group full-width">
                                <label className="checkbox-label flex items-center gap-2 cursor-pointer text-sm text-[rgba(255,255,255,0.8)] user-select-none">
                                    <input type="checkbox" id="tiledVAECheck" checked={settings.useTiledVAE} onChange={(e) => setSettings({...settings, useTiledVAE: e.target.checked})} className="hidden" />
                                    <span className="checkmark w-4 h-4 border-2 border-[rgba(255,255,255,0.2)] rounded-sm relative transition-all duration-300 flex items-center justify-center">
                                        {settings.useTiledVAE && <span className="text-xs text-white font-bold">✓</span>}
                                    </span>
                                    Tiled VAE (reduces memory usage)
                                </label>
                            </div>
                            <div className="setting-group full-width">
                                <label className="checkbox-label flex items-center gap-2 cursor-pointer text-sm text-[rgba(255,255,255,0.8)] user-select-none">
                                    <input type="checkbox" id="lowMemory" checked={settings.lowMemoryMode} onChange={(e) => setSettings({...settings, lowMemoryMode: e.target.checked})} className="hidden" />
                                    <span className="checkmark w-4 h-4 border-2 border-[rgba(255,255,255,0.2)] rounded-sm relative transition-all duration-300 flex items-center justify-center">
                                        {settings.lowMemoryMode && <span className="text-xs text-white font-bold">✓</span>}
                                    </span>
                                    Low Memory Mode (unloads unet when decoding)
                                </label>
                            </div>
                            {settings.useTiledVAE && (
                                <div className="setting-group full-width">
                                    <label htmlFor="tileSizeSlider" className="text-sm text-[rgba(255,255,255,0.8)] font-medium">Tile Size: <span className="value-display text-[var(--color-accent-primary)] font-semibold">{settings.tileSize}</span>px</label>
                                    <input type="range" id="tileSizeSlider" min="64" max="512" step="64" value={settings.tileSize} onChange={(e) => setSettings({...settings, tileSize: parseInt(e.target.value)})} className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-sm outline-none appearance-none slider-thumb:bg-[var(--color-accent-primary)] slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:cursor-pointer mt-2" />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Model Settings */}
            <div className="settings-section border border-[rgba(255,255,255,0.05)] rounded-lg bg-[var(--color-bg-secondary)] backdrop-blur-[10px] overflow-hidden">
                <div className="section-header flex items-center justify-between p-3 bg-[var(--color-bg-primary)] border-b border-[rgba(255,255,255,0.05)] cursor-pointer transition-all duration-300 hover:bg-[var(--color-bg-primary)]" onClick={() => toggleSection('model')}>
                    <h3 className="text-lg font-semibold text-[var(--color-text-primary)] m-0">Model</h3>
                    <span className={`toggle-icon text-sm text-gray-400 transition-all duration-300 ${expandedSections.model ? 'expanded rotate-180 text-[var(--color-accent-primary)]' : ''}`}>▼</span>
                </div>
                {expandedSections.model && (
                    <div className="section-content p-4">
                        <div className="model-select-group flex flex-col gap-2 mb-4">
                            <label htmlFor="modelSelect" className="text-sm text-[rgba(255,255,255,0.8)] font-medium">AI Model:</label>
                            <select id="modelSelect" value={settings.model} onChange={(e) => { setSettings({...settings, model: e.target.value}); setBaseUrl(e.target.value); }} className="w-full p-2 bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-md text-[var(--color-text-primary)] text-sm cursor-pointer transition-all duration-300 focus:outline-none focus:border-[var(--color-accent-primary)] focus:shadow-[0_0_0_3px_rgba(14,165,233,0.3)] relative z-50">
                                <option value="subpixel/small-stable-diffusion-v0-onnx-ort-web" className="bg-gray-800 text-[var(--color-text-primary)]">Small Stable Diffusion V0</option>
                                <option value="subpixel/Typhoon-SD15-V2-onnx" className="bg-gray-800 text-[var(--color-text-primary)]">Typhoon SD (realistic)</option>
                                <option value="subpixel/animeanything_v10-onnx" className="bg-gray-800 text-[var(--color-text-primary)]">Anythingv10 (Anime)</option>
                            </select>
                        </div>
                        <button id="clearCacheButton" disabled={generator?.isGenerating} onClick={clearModelCache} className="flex items-center gap-2 px-3 py-2 bg-red-600 hover:bg-red-500 disabled:bg-red-600 disabled:opacity-60 disabled:cursor-not-allowed text-white font-medium text-sm rounded-md transition-all duration-300">
                            <span className="btn-icon text-base">🗑️</span>
                            Clear Model Cache
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
