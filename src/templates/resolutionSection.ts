export const resolutionSectionTemplate = `
  <div class="resolution-section">
    <h3>Resolution</h3>
    <div class="resolution-buttons">
      <button class="resolution-btn" data-resolution="64">64px</button>
      <button class="resolution-btn" data-resolution="128">128px</button>
      <button class="resolution-btn" data-resolution="256">256px</button>
      <button class="resolution-btn" data-resolution="512">512px</button>
      <button class="resolution-btn" data-resolution="1024">1024px</button>
      <button class="resolution-btn active" data-resolution="1536">1536px</button>
      <button class="resolution-btn" data-resolution="4MP">4MP</button>
      <button class="resolution-btn" data-resolution="8MP">8MP</button>
      <button class="resolution-btn" data-resolution="12MP">12MP</button>
    </div>
    <div class="resolution-sliders hidden">
      <div class="setting-group">
        <label>Width</label>
        <input type="range" id="widthSlider" min="64" max="2560" value="512" step="64">
        <span id="widthValue">512</span>px
      </div>
      <div class="setting-group">
        <label>Height</label>
        <input type="range" id="heightSlider" min="64" max="2560" value="512" step="64">
        <span id="heightValue">512</span>px
      </div>
    </div>
  </div>
`;
