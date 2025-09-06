import { useEffect, useState } from "react"

export default function CanvasSection({ canvasRef, loadingText, settings }: { canvasRef: React.RefObject<HTMLCanvasElement | null>, loadingText?: string, settings: any }) {
  const [progress, setProgress] = useState(0);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (loadingText) {
      setIsLoading(true);
      // Parse progress from loading text (e.g., "Stage (50%)")
      const match = loadingText.match(/\((\d+)%\)/);
      if (match) {
        setProgress(parseInt(match[1]));
      }
    } else {
      setIsLoading(false);
      setProgress(0);
    }
  }, [loadingText]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    canvas.width = settings.width;
    canvas.height = settings.height;
    // Clear the canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    if (settings.previewUrl) {
      const img = new Image();
      img.src = settings.previewUrl;
      img.onload = () => {
        ctx.drawImage(img, 0, 0, settings.width, settings.height);
        // Add fade-in animation
        canvas.style.animation = 'canvasFadeIn 0.5s ease-in-out';
      };
    }

  }, [settings.previewUrl]);

  return (
    <div className="canvas-panel" style={{ minHeight: '600px', position: 'relative' }}>
      <div className="canvas-container">
        <canvas id="imageCanvas" ref={canvasRef} style={{ maxHeight: '100%', maxWidth: '100%' }}></canvas>
      </div>
      {isLoading && (
        <div className="loading-section" style={{ width: '320px' }}>
          <div className="progress-container">
            <div className="progress-bar">
              <div
                className="progress-fill"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="progress-text">{progress}%</span>
          </div>
          <p className="loading-text-modern">{loadingText?.replace(/\s*\(\d+%\)/, '') || 'Generating...'}</p>
        </div>
      )}
    </div>
  )
}
