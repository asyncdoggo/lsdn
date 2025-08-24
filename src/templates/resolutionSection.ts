export const resolutionSectionTemplate = `
  <div class="resolution-section">
    <div class="resolution-header">
      <h3>Resolution</h3>
      <!-- Info icon -->
      <div class="info-icon" title="Recommended resolutions: 512x512, 512x768, 768x512. At least one of width or height must be 512px due to model constraints."  id="infoIcon">
        <img src="info.png" alt="Info">
      </div>
    </div>
    <div class="resolution-sliders">
      <div class="setting-group">
        <label>Width: <span id="widthValue">512</span>px</label>
        <input type="range" id="widthSlider" min="64" max="2560" value="512" step="64">
      </div>
      <div class="setting-group">
        <label>Height: <span id="heightValue">512</span>px</label>
        <input type="range" id="heightSlider" min="64" max="2560" value="512" step="64">
      </div>
    </div>
  </div>
`;
