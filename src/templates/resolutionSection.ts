export const resolutionSectionTemplate = `
  <div class="resolution-section">
    <h3>Resolution</h3>
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
