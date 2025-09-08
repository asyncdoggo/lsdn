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
    <div className="resolution-section mb-4 border border-[rgba(255,255,255,0.05)] rounded-lg bg-[rgba(255,255,255,0.05)] backdrop-blur-[10px]">
      <div className="resolution-header flex items-center justify-between p-3 bg-[rgba(255,255,255,0.1)] border-b border-[rgba(255,255,255,0.05)]">
        <h3 className="text-lg font-semibold text-[rgba(255,255,255,0.87)] m-0">Resolution</h3>
        {/* Info icon */}
        <div className="info-icon cursor-pointer opacity-60 hover:opacity-100 transition-opacity duration-300" title="Recommended resolutions: 512x512, 512x768, 768x512. At least one of width or height must be 512px due to model constraints." id="infoIcon">
          <svg className="w-5 h-5 text-[rgba(255,255,255,0.6)]" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
          </svg>
        </div>
      </div>
      <div className="resolution-presets p-4">
        <div className="grid grid-cols-3 gap-2 mb-4">
          {presetResolutions.map((preset) => (
            <button
              key={preset.label}
              className={`preset-button p-2 text-sm font-medium rounded-md transition-all duration-300 transform hover:-translate-y-0.5 hover:shadow-md ${
                settings.width === preset.width && settings.height === preset.height
              ? 'bg-[var(--color-accent-primary)] text-[var(--color-text-primary)] shadow-lg'
              : 'bg-[rgba(255,255,255,0.1)] text-[rgba(255,255,255,0.8)] hover:bg-[rgba(255,255,255,0.2)]'
              }`}
              onClick={() => applyPreset(preset.width, preset.height)}
              title={`Set resolution to ${preset.label}`}
            >
              {preset.label}
            </button>
          ))}
        </div>
      </div>
      <div className="resolution-sliders p-4 pt-0">
        <div className="setting-group mb-4">
          <label className="text-sm text-[rgba(255,255,255,0.8)] font-medium mb-2 block">Width: <span className="text-[var(--color-accent-primary)] font-semibold">{settings.width}</span>px</label>
          <input type="range" id="widthSlider" min="64" max="2560" value={settings.width} step="64" onChange={(e) => setSettings({...settings, width: parseInt(e.target.value)})} className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-sm outline-none appearance-none slider-thumb:bg-[var(--color-accent-primary)] slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:cursor-pointer" />
        </div>
        <div className="setting-group">
          <label className="text-sm text-[rgba(255,255,255,0.8)] font-medium mb-2 block">Height: <span className="text-[var(--color-accent-primary)] font-semibold">{settings.height}</span>px</label>
          <input type="range" id="heightSlider" min="64" max="2560" value={settings.height} step="64" onChange={(e) => setSettings({...settings, height: parseInt(e.target.value)})} className="w-full h-1 bg-[rgba(255,255,255,0.1)] rounded-sm outline-none appearance-none slider-thumb:bg-[var(--color-accent-primary)] slider-thumb:w-4 slider-thumb:h-4 slider-thumb:rounded-full slider-thumb:cursor-pointer" />
        </div>
      </div>
    </div>
  );
}
