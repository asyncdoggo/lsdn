import { useEffect } from "react"

export default function CanvasSection({ canvasRef, loadingText, settings }: { canvasRef: React.RefObject<HTMLCanvasElement | null>, loadingText?: string, settings: any }) {

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
      };
    }

  }, [settings.previewUrl]);

  return (
    <div className="canvas-panel">
      <div className="canvas-container">
        <canvas id="imageCanvas" ref={canvasRef}></canvas>
      </div>
      <div className="status-section">
        {loadingText && (
          <>
            <div className="loading-spinner"></div>
            <p className="loading-text">{loadingText}</p>
          </>
        )}
      </div>
    </div>
  )
}