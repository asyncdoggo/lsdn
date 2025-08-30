import { setBaseUrl } from "../core/modelManager";
import type { TextToImageGenerator } from "../textToImageGenerator";

export default function TextToImageSection({settings, setSettings, generator}: {settings: any, setSettings: any, generator: TextToImageGenerator | null}) {

    const clearModelCache = () => {
        const confirm = window.confirm("Are you sure you want to clear the model cache?");
        if (confirm) {
            generator?.clearCache();
        }
    };

    return (
        <div className="text-to-image-section">
            <h3>Text Prompt</h3>
            <div className="prompt-controls">
                <label htmlFor="promptInput">Positive Prompt (Things you want)</label>
                <textarea
                    id="promptInput"
                    placeholder="Enter your text prompt here... (e.g., 'a beautiful sunset over mountains')"
                    rows={3}
                    maxLength={500}
                    value={settings.prompt}
                    onChange={(e) => setSettings({...settings, prompt: e.target.value})}
                ></textarea>
                <label htmlFor="negativePromptInput">Negative Prompt (Optional, Things you don't want)</label>
                <textarea
                    id="negativePromptInput"
                    placeholder="blurry, low quality, distorted, noise, artifacts, oversaturated"
                    rows={2}
                    maxLength={300}
                    value={settings.negativePrompt}
                    onChange={(e) => setSettings({...settings, negativePrompt: e.target.value})}
                ></textarea>
                <div className="ai-settings">
                    <div className="setting-group">
                        <label title="Number of denoising steps">Steps: <span id="stepsValue">{settings.steps}</span></label>
                        <input type="range" id="stepsSlider" min="1" max="50" value={settings.steps} onChange={(e) => setSettings({...settings, steps: parseInt(e.target.value)})} />
                    </div>
                    <div className="setting-group">
                        <label title="How strongly the AI should follow the prompt">Guidance: <span id="guidanceValue">{settings.guidance}</span></label>
                        <input type="range" id="guidanceSlider" min="1" max="15" step="0.5" value={settings.guidance} onChange={(e) => setSettings({...settings, guidance: parseFloat(e.target.value)})} />
                    </div>
                    <div className="setting-group">
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
                    <div className="setting-group">
                        <label id="seedLabel" htmlFor="seedInput">Seed (optional):</label>
                        <div className="randomize-seed">
                            <label htmlFor="randomizeSeed">Randomize?</label>
                            <input type="checkbox" checked={settings.randomize} id="randomizeSeed" onChange={(e) => setSettings({...settings, randomize: e.target.checked})} />
                        </div>
                        <input type="number" id="seedInput" placeholder="Random" min="0" max="999999" value={settings.seed} onChange={(e) => setSettings({...settings, seed: parseInt(e.target.value)})} />
                    </div>
                    <div className="setting-group">
                        <label htmlFor="tiledVAECheck" className="check-group">
                            <input type="checkbox" id="tiledVAECheck" checked={settings.useTiledVAE} onChange={(e) => setSettings({...settings, useTiledVAE: e.target.checked})} />
                            Tiled VAE (reduces memory usage)
                        </label>
                    </div>
                    <div className="setting-group">
                        <label htmlFor="lowMemory" className="check-group">
                            <input type="checkbox" id="lowMemory" checked={settings.lowMemoryMode} onChange={(e) => setSettings({...settings, lowMemoryMode: e.target.checked})} />
                            Low Memory Mode (unloads unet when decoding)
                        </label>
                    </div>
                    <div className="setting-group" id="tileSizeGroup">
                        <label htmlFor="tileSizeSlider">Tile Size: <span id="tileSizeValue">{settings.tileSize}</span>px</label>
                        <input type="range" id="tileSizeSlider" min="64" max="512" step="64" value={settings.tileSize} onChange={(e) => setSettings({...settings, tileSize: parseInt(e.target.value)})} />
                    </div>
                </div>
                <div className="model-status">
                    <div className="model-select-group">
                        <label htmlFor="modelSelect">Model:</label>
                        <select id="modelSelect" value={settings.model} onChange={(e) => { setSettings({...settings, model: e.target.value}); setBaseUrl(e.target.value); }}>
                            <option value="subpixel/small-stable-diffusion-v0-onnx-ort-web">Small Stable Diffusion V0</option>
                            <option value="subpixel/Typhoon-SD15-V2-onnx">Typhoon SD (realistic)</option>
                            <option value="subpixel/animeanything_v10-onnx">Anythingv10 (Anime)</option>
                        </select>
                    </div>
                    <button id="clearCacheButton" disabled={generator?.isGenerating} onClick={clearModelCache}>Clear Model Cache</button>
                </div>
            </div>
        </div>
    )
}