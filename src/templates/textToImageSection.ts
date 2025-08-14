export const textToImageSectionTemplate = `
  <div class="text-to-image-section hidden">
    <h3>Text Prompt</h3>
    <div class="prompt-controls">
      <textarea 
        id="promptInput" 
        placeholder="Enter your text prompt here... (e.g., 'a beautiful sunset over mountains')"
        rows="3"
        maxlength="500"
      ></textarea>
      <textarea 
        id="negativePromptInput" 
        placeholder="Negative prompt (optional) - what you DON'T want..."
        rows="2"
        maxlength="300"
      ></textarea>
      <div class="ai-settings">
        <div class="setting-group">
          <label for="stepsSlider">Steps: <span id="stepsValue">20</span></label>
          <input type="range" id="stepsSlider" min="1" max="50" value="20" />
        </div>
        <div class="setting-group">
          <label for="guidanceSlider">Guidance: <span id="guidanceValue">7.5</span></label>
          <input type="range" id="guidanceSlider" min="1" max="20" step="0.5" value="7.5" />
        </div>
        <div class="setting-group">
          <label for="schedulerSelect">Scheduler:</label>
          <select id="schedulerSelect">
            <option value="euler-karras">Euler Karras</option>
            <option value="ddpm">DDPM</option>
          </select>
        </div>
        <div class="setting-group">
          <label for="seedInput">Seed (optional):</label>
          <input type="number" id="seedInput" placeholder="Random" min="0" max="999999" />
        </div>
      </div>
      <div class="model-status">
        <div class="status-indicator" id="modelStatus">
          <span class="status-dot"></span>
          <span class="status-text">Models not loaded</span>
        </div>
        <button id="loadModelsBtn" class="load-models-btn">
          <span class="btn-icon">📥</span>
          <span class="btn-text">Load AI Models</span>
        </button>
      </div>
    </div>
  </div>
`;
