export const textToImageSectionTemplate = `
  <div class="text-to-image-section">
    <h3>Text Prompt</h3>
    <div class="prompt-controls">
    <label for="promptInput">Positive Prompt (Things you want)</label>
      <textarea 
        id="promptInput" 
        placeholder="Enter your text prompt here... (e.g., 'a beautiful sunset over mountains')"
        rows="3"
        maxlength="500"
      ></textarea>
      <label for="negativePromptInput">Negative Prompt (Optional, Things you don't want)</label>
      <textarea 
        id="negativePromptInput" 
        placeholder="blurry, low quality, distorted, noise, artifacts, oversaturated"
        rows="2"
        maxlength="300"
      ></textarea>
      <div class="img-prompt">
        <label for="imgPromptInput">Image Prompt (Optional)</label>
        <!-- Info icon -->
        <div class="info-icon" title="Use an image to guide the generation process."  id="infoIcon">
          <img src="info.png" alt="Info">
        </div>
        <input type="file" id="imgPromptInput" accept="image/*" />
        <label for="imgPromptStrength">Image Prompt Strength: <span id="imgPromptStrengthValue">0.5</span></label>
        <input type="range" id="imgPromptStrength" min="0" max="1" step="0.1" value="0.5" />
      </div>
      <div class="ai-settings">
        <div class="setting-group">
          <label title="Number of denoising steps">Steps: <span id="stepsValue">20</span></label>
          <input type="range" id="stepsSlider" min="1" max="50" value="20" />
        </div>
        <div class="setting-group">
          <label title="How strongly the AI should follow the prompt">Guidance: <span id="guidanceValue">7.5</span></label>
          <input type="range" id="guidanceSlider" min="1" max="15" step="0.5" value="7.5" />
        </div>
        <div class="setting-group">
          <label for="schedulerSelect">Scheduler:</label>
          <select id="schedulerSelect">
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
        <div class="setting-group">
          <label id="seedLabel" for="seedInput">Seed (optional):</label>
          <div class="randomize-seed">
            <label for="randomizeSeed">Randomize?</label>
            <input type="checkbox" checked id="randomizeSeed" />
          </div>
          <input type="number" id="seedInput" placeholder="Random" min="0" max="999999" />
        </div>
        <div class="setting-group">
          <label for="tiledVAECheck">
            <input type="checkbox" id="tiledVAECheck" checked />
            Tiled VAE (reduces memory usage)
          </label>
        </div>
        <div class="setting-group">
          <label for="lowMemory">
            <input type="checkbox" id="lowMemory" checked />
            Low Memory Mode (unloads unet when decoding)
          </label>
        </div>
        <div class="setting-group" id="tileSizeGroup">
          <label for="tileSizeSlider">Tile Size: <span id="tileSizeValue">256</span>px</label>
          <input type="range" id="tileSizeSlider" min="64" max="512" step="64" value="256" />
        </div>
      </div>
      <div class="model-status">
          <div class="model-select-group">
            <label for="modelSelect">Model:</label>
            <select id="modelSelect">
            <option value="subpixel/small-stable-diffusion-v0-onnx-ort-web">Small Stable Diffusion V0</option>
            <option value="subpixel/Typhoon-SD15-V2-onnx">Typhoon SD (realistic)</option>
            <option value="subpixel/animeanything_v10-onnx">Anythingv10 (Anime)</option>
            </select>
          </div>
          <button id="clearCacheButton">Clear Model Cache</button>
      </div>
    </div>
  </div>
`;
