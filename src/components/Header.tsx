export default function Header() {
  return (
    <header className="app-header">
      <div className="header-content">
        <div className="logo-section">
          <div className="logo-icon">
            <svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
              <rect width="32" height="32" rx="8" fill="url(#gradient)" />
              <path d="M8 12L16 8L24 12V20L16 24L8 20V12Z" fill="white" opacity="0.9" />
              <path d="M12 14L16 12L20 14V18L16 20L12 18V14Z" fill="white" opacity="0.7" />
              <defs>
                <linearGradient id="gradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#0ea5e9" />
                  <stop offset="100%" stopColor="#0369a1" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <h1>ToI</h1>
        </div>
        <p className="app-subtitle">Generate images with text using your GPU</p>
        <div className="header-accent">
          <div className="accent-line"></div>
        </div>
      </div>
    </header>
  );
}
