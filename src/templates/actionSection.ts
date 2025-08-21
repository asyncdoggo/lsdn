export const actionSectionTemplate = `
  <div class="action-section">
    <div class="history-controls">
      <select id="history" class="history-select">
        <option value="">History</option>
      </select>
    </div>
    <div class="action-buttons">
      <button id="generate" class="generate-btn" type="button">
        <span class="btn-icon">✨</span>
        <span class="btn-text">Generate</span>
      </button>
      <button id="stop" class="stop-btn" type="button" disabled style="display: none;">
        <span class="btn-icon">⏹️</span>
        <span class="btn-text">Stop</span>
      </button>
      <button id="download" class="download-btn" type="button" disabled>
        <span class="btn-icon">💾</span>
        <span class="btn-text">Download</span>
      </button>
    </div>
  </div>
`;
