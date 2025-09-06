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
        <div className="text-to-image-section">
            {/* Prompts Section */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('prompts')}>
                    <h3>Text Prompts</h3>
                    <span className={`toggle-icon ${expandedSections.prompts ? 'expanded' : ''}`}>▼</span>
                </div>
                {expandedSections.prompts && (
                    <div className="section-content">
                        <div className="prompt-group">
                            <label htmlFor="promptInput" className="prompt-label positive">
                                <span className="label-icon">✨</span>
                                Positive Prompt
                            </label>
                            <textarea
                                id="promptInput"
                                placeholder="Describe what you want to see... (e.g., 'a beautiful sunset over mountains, photorealistic')"
                                rows={3}
                                maxLength={500}
                                value={settings.prompt}
                                onChange={(e) => setSettings({...settings, prompt: e.target.value})}
                            />
                            <div className="char-count">{settings.prompt.length}/500</div>
                        </div>
                        <div className="prompt-group">
                            <label htmlFor="negativePromptInput" className="prompt-label negative">
                                <span className="label-icon">🚫</span>
                                Negative Prompt
                            </label>
                            <textarea
                                id="negativePromptInput"
                                placeholder="Describe what you don't want... (e.g., 'blurry, low quality, distorted')"
                                rows={2}
                                maxLength={300}
                                value={settings.negativePrompt}
                                onChange={(e) => setSettings({...settings, negativePrompt: e.target.value})}
                            />
                            <div className="char-count">{settings.negativePrompt.length}/300</div>
                        </div>
                    </div>
                )}
            </div>

            {/* Generation Settings */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('generation')}>
                    <h3>Generation Settings</h3>
                    <span className={`toggle-icon ${expandedSections.generation ? 'expanded' : ''}`}>▼</span>
                </div>
                {expandedSections.generation && (
                    <div className="section-content">
                        <div className="settings-grid">
                            <div className="setting-group">
                                <label title="Number of denoising steps">Steps: <span className="value-display">{settings.steps}</span></label>
                                <input type="range" id="stepsSlider" min="1" max="50" value={settings.steps} onChange={(e) => setSettings({...settings, steps: parseInt(e.target.value)})} />
                            </div>
                            <div className="setting-group">
                                <label title="How strongly the AI should follow the prompt">Guidance: <span className="value-display">{settings.guidance}</span></label>
                                <input type="range" id="guidanceSlider" min="1" max="15" step="0.5" value={settings.guidance} onChange={(e) => setSettings({...settings, guidance: parseFloat(e.target.value)})} />
                            </div>
                            <div className="setting-group full-width">
                                <label htmlFor="schedulerSelect">Scheduler:</label>
                                <select id="schedulerSelect" value={settings.scheduler} onChange={(e) => setSettings({...settings, scheduler: e.target.value})}>
                                    <optgroup label="Euler Method">
                                        <option value="euler-karras">Euler (Karras)</option>
                                        <option value="euler-linear">Euler (Linear)</option>
                                        <option value="euler-exponential">Euler (Exponential)</option>
                                    </optgroup>
                                    <optgroup label="DPM++ 2M SDE">
                                        <option value="dpmpp-2m-sde-karras">DPM++ 2M SDE (Karras)</option>
                                        <option value="dpmpp-2m-sde-linear">DPM++ 2M SDE (Linear)</option>
                                        <option value="dpmpp-2m-sde-exponential">DPM++ 2M SDE (Exponential)</option>
                                    </optgroup>
                                    <optgroup label="Other Methods">
                                        <option value="ddpm">DDPM</option>
                                        <option value="lms">LMS (Linear Multi-Step)</option>
                                        <option value="heun">Heun (2nd Order)</option>
                                    </optgroup>
                                </select>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Advanced Settings */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('advanced')}>
                    <h3>Advanced Settings</h3>
                    <span className={`toggle-icon ${expandedSections.advanced ? 'expanded' : ''}`}>▼</span>
                </div>
                {expandedSections.advanced && (
                    <div className="section-content">
                        <div className="settings-grid">
                            <div className="setting-group full-width">
                                <label id="seedLabel" htmlFor="seedInput">Seed:</label>
                                <div className="seed-controls">
                                    <input type="number" id="seedInput" placeholder="Random" min="0" max="999999" value={settings.seed} onChange={(e) => setSettings({...settings, seed: parseInt(e.target.value)})} />
                                    <label className="checkbox-label">
                                        <input type="checkbox" checked={settings.randomize} onChange={(e) => setSettings({...settings, randomize: e.target.checked})} />
                                        <span className="checkmark"></span>
                                        Randomize
                                    </label>
                                </div>
                            </div>
                            <div className="setting-group full-width">
                                <label className="checkbox-label">
                                    <input type="checkbox" id="tiledVAECheck" checked={settings.useTiledVAE} onChange={(e) => setSettings({...settings, useTiledVAE: e.target.checked})} />
                                    <span className="checkmark"></span>
                                    Tiled VAE (reduces memory usage)
                                </label>
                            </div>
                            <div className="setting-group full-width">
                                <label className="checkbox-label">
                                    <input type="checkbox" id="lowMemory" checked={settings.lowMemoryMode} onChange={(e) => setSettings({...settings, lowMemoryMode: e.target.checked})} />
                                    <span className="checkmark"></span>
                                    Low Memory Mode (unloads unet when decoding)
                                </label>
                            </div>
                            {settings.useTiledVAE && (
                                <div className="setting-group full-width">
                                    <label htmlFor="tileSizeSlider">Tile Size: <span className="value-display">{settings.tileSize}</span>px</label>
                                    <input type="range" id="tileSizeSlider" min="64" max="512" step="64" value={settings.tileSize} onChange={(e) => setSettings({...settings, tileSize: parseInt(e.target.value)})} />
                                </div>
                            )}
                        </div>
                    </div>
                )}
            </div>

            {/* Model Settings */}
            <div className="settings-section">
                <div className="section-header" onClick={() => toggleSection('model')}>
                    <h3>Model</h3>
                    <span className={`toggle-icon ${expandedSections.model ? 'expanded' : ''}`}>▼</span>
                </div>
                {expandedSections.model && (
                    <div className="section-content">
                        <div className="model-select-group">
                            <label htmlFor="modelSelect">AI Model:</label>
                            <select id="modelSelect" value={settings.model} onChange={(e) => { setSettings({...settings, model: e.target.value}); setBaseUrl(e.target.value); }}>
                                <option value="subpixel/small-stable-diffusion-v0-onnx-ort-web">Small Stable Diffusion V0</option>
                                <option value="subpixel/Typhoon-SD15-V2-onnx">Typhoon SD (realistic)</option>
                                <option value="subpixel/animeanything_v10-onnx">Anythingv10 (Anime)</option>
                            </select>
                        </div>
                        <button id="clearCacheButton" disabled={generator?.isGenerating} onClick={clearModelCache}>
                            <span className="btn-icon">🗑️</span>
                            Clear Model Cache
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
