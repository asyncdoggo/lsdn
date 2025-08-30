export default function CanvasSection({ canvasRef, loadingText }: { canvasRef: React.RefObject<HTMLCanvasElement | null>, loadingText?: string }) {
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