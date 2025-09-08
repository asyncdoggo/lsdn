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
    <div className="flex-1 flex flex-col justify-center items-center p-8 bg-[var(--color-bg-secondary)] backdrop-blur-[10px] gap-4 border-l border-[rgba(255,255,255,0.05)] relative" style={{ minHeight: '600px' }}>
      <div className="h-4/5 flex justify-center items-center">
        <canvas
          id="imageCanvas"
          ref={canvasRef}
          className="border-2 border-[rgba(255,255,255,0.1)] rounded-xl shadow-2xl max-h-full max-w-full object-contain transition-all duration-300 hover:border-[rgba(255,255,255,0.2)] hover:shadow-3xl"
          style={{ height: '600px' }}
        ></canvas>
      </div>
      {isLoading && (
        <div className="flex flex-col items-center justify-center gap-2 mt-2 p-2 bg-[rgba(255,255,255,0.05)] rounded-lg border border-[rgba(255,255,255,0.1)] shadow-2xl backdrop-blur-[10px] max-w-[300px] text-sm" style={{ width: '320px' }}>
          <div className="flex flex-col items-center gap-2 w-[200px]">
            <div className="w-full h-1.5 bg-[rgba(255,255,255,0.2)] rounded-sm overflow-hidden relative">
              <div
                className="h-full bg-gradient-to-r from-[var(--color-accent-primary)] to-[var(--color-accent-primary-hover)] rounded-sm transition-all duration-300 relative"
                style={{ width: `${progress}%` }}
              ></div>
            </div>
            <span className="text-[var(--color-text-primary)] text-sm font-semibold tabular-nums">{progress}%</span>
          </div>
          <p className="text-[var(--color-text-primary)] text-base font-medium m-0 text-center animate-pulse">{loadingText?.replace(/\s*\(\d+%\)/, '') || 'Generating...'}</p>
        </div>
      )}
    </div>
  )
}
