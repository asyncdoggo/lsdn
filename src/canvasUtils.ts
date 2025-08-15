import type { Resolution } from './imageGenerator';

/**
 * Utility class for canvas display and download operations
 */
export class CanvasUtils {
  /**
   * Scales the canvas display size to fit the viewport while maintaining aspect ratio
   */
  static scaleCanvasDisplay(canvas: HTMLCanvasElement, resolution: Resolution): void {
    const maxDisplayWidth = Math.min(800, window.innerWidth - 40);
    const maxDisplayHeight = Math.min(600, window.innerHeight - 200);
    
    const aspectRatio = resolution.width / resolution.height;
    let displayWidth = maxDisplayWidth;
    let displayHeight = displayWidth / aspectRatio;
    
    if (displayHeight > maxDisplayHeight) {
      displayHeight = maxDisplayHeight;
      displayWidth = displayHeight * aspectRatio;
    }
    
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
    // Reset image rendering for high-resolution final images
    canvas.style.imageRendering = 'auto';
  }

  /**
   * Downloads the canvas content as a PNG image
   */
  static downloadImage(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Creates and sets up a canvas with the specified resolution
   */
  static setupCanvas(canvas: HTMLCanvasElement, resolution: Resolution): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Unable to get canvas context');
    }

    // Set canvas dimensions (this automatically clears the canvas)
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    
    // Explicitly clear the canvas to ensure no previous content remains
    ctx.clearRect(0, 0, resolution.width, resolution.height);
    
    return ctx;
  }

  /**
   * Validates that a canvas context is available
   */
  static validateCanvasContext(canvas: HTMLCanvasElement): CanvasRenderingContext2D {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      throw new Error('Unable to get canvas context');
    }
    return ctx;
  }
}
