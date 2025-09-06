const presetResolutions = [
  { label: '512x512', width: 512, height: 512 },
  { label: '512x768', width: 512, height: 768 },
  { label: '768x512', width: 768, height: 512 },
];

export default function ResolutionSection({settings, setSettings}: {settings: any, setSettings: any}) {
  const applyPreset = (width: number, height: number) => {
    setSettings({...settings, width, height});
  };

  return (
    <div className="resolution-section">
      <div className="resolution-header">
        <h3>Resolution</h3>
        {/* Info icon */}
        <div className="info-icon" title="Recommended resolutions: 512x512, 512x768, 768x512. At least one of width or height must be 512px due to model constraints."  id="infoIcon">
          <img src="info.png" alt="Info" />
        </div>
      </div>
      <div className="resolution-presets">
        {presetResolutions.map((preset) => (
          <button
            key={preset.label}
            className={`preset-button ${settings.width === preset.width && settings.height === preset.height ? 'active' : ''}`}
            onClick={() => applyPreset(preset.width, preset.height)}
            title={`Set resolution to ${preset.label}`}
          >
            {preset.label}
          </button>
        ))}
      </div>
      <div className="resolution-sliders">
        <div className="setting-group">
          <label>Width: <span id="widthValue">{settings.width}</span>px</label>
          <input type="range" id="widthSlider" min="64" max="2560" value={settings.width} step="64" onChange={(e) => setSettings({...settings, width: parseInt(e.target.value)})} />
        </div>
        <div className="setting-group">
          <label>Height: <span id="heightValue">{settings.height}</span>px</label>
          <input type="range" id="heightSlider" min="64" max="2560" value={settings.height} step="64" onChange={(e) => setSettings({...settings, height: parseInt(e.target.value)})} />
        </div>
      </div>
    </div>
  );
}
