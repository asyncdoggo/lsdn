export default function Header() {
  return (
    <header className="app-header p-6 bg-[var(--color-bg-primary)] border-b border-[rgba(255,255,255,0.05)] backdrop-blur-[10px]">
      <div className="header-content max-w-4xl mx-auto text-center">
        <div className="logo-section flex items-center justify-center gap-3 mb-3">
          <div className="logo-icon">
            <svg width="40" height="40" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
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
          <h1 className="text-3xl font-bold text-[var(--color-text-primary)] m-0">ToI</h1>
        </div>
        <p className="app-subtitle text-lg text-[rgba(255,255,255,0.6)] mb-4 font-medium">Generate images with text using your GPU</p>
        <a href="https://github.com/asyncdoggo/lsdn" target="_blank" rel="noopener noreferrer" className="github-link inline-block mb-4 text-[var(--color-accent-primary)] hover:text-[var(--color-accent-primary-hover)] font-semibold transition-colors duration-200">
          View on GitHub
        </a>
        <div className="header-accent flex justify-center">
          <div className="accent-line w-24 h-1 bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-primary-hover)] rounded-full"></div>
        </div>
      </div>
    </header>
  );
}
