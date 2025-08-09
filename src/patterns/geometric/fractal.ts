import type { Resolution } from '../../imageGenerator';

export class FractalPattern {
  /**
   * Generates a fractal pattern using the Mandelbrot set
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const maxIterations = 50;
    const zoom = 0.5 + Math.random() * 1.5; // Random zoom level
    const offsetX = (Math.random() - 0.5) * 2; // Random offset
    const offsetY = (Math.random() - 0.5) * 2;
    
    // Generate Mandelbrot-like fractal
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Map pixel coordinates to complex plane
        const zx = (x / resolution.width - 0.5) * 4 * zoom + offsetX;
        const zy = (y / resolution.height - 0.5) * 4 * zoom + offsetY;
        
        // Mandelbrot iteration
        let cx = zx;
        let cy = zy;
        let iterations = 0;
        
        while (iterations < maxIterations && (cx * cx + cy * cy) < 4) {
          const temp = cx * cx - cy * cy + zx;
          cy = 2 * cx * cy + zy;
          cx = temp;
          iterations++;
        }
        
        // Create binary black/white pattern based on iterations
        const value = iterations < maxIterations ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }
}
