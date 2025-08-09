import type { Resolution } from '../../imageGenerator';

export class FractalPattern {
  /**
   * Generates sophisticated fractal patterns with multiple algorithms
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const fractalType = Math.floor(Math.random() * 7);
    
    switch (fractalType) {
      case 0:
        this.generateMandelbrotSet(data, resolution);
        break;
      case 1:
        this.generateJuliaSet(data, resolution);
        break;
      case 2:
        this.generateBurningShip(data, resolution);
        break;
      case 3:
        this.generateTricorn(data, resolution);
        break;
      case 4:
        this.generateSierpinskiTriangle(data, resolution);
        break;
      case 5:
        this.generateDragonCurve(data, resolution);
        break;
      case 6:
        this.generateBarnsleyFern(data, resolution);
        break;
    }
  }

  /**
   * Enhanced Mandelbrot set with zoom and exploration
   */
  private static generateMandelbrotSet(data: Uint8ClampedArray, resolution: Resolution): void {
    const maxIterations = 100 + Math.floor(Math.random() * 200);
    const zoom = Math.pow(2, Math.random() * 10 - 2); // Random zoom from 0.25x to 256x
    
    // Interesting areas of the Mandelbrot set
    const interestingPoints = [
      { x: -0.5, y: 0 },       // Main bulb
      { x: -0.8, y: 0.156 },   // Seahorse valley
      { x: -0.16, y: 1.0407 }, // Lightning
      { x: -1.25066, y: 0.02012 }, // Elephant valley
      { x: -0.7269, y: 0.1889 },   // Spiral
    ];
    
    const center = interestingPoints[Math.floor(Math.random() * interestingPoints.length)];
    const offsetX = center.x + (Math.random() - 0.5) * 0.1 / zoom;
    const offsetY = center.y + (Math.random() - 0.5) * 0.1 / zoom;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        const zx = (x / resolution.width - 0.5) * 4 / zoom + offsetX;
        const zy = (y / resolution.height - 0.5) * 4 / zoom + offsetY;
        
        let cx = zx;
        let cy = zy;
        let iterations = 0;
        
        while (iterations < maxIterations && (cx * cx + cy * cy) < 4) {
          const temp = cx * cx - cy * cy + zx;
          cy = 2 * cx * cy + zy;
          cx = temp;
          iterations++;
        }
        
        const value = iterations < maxIterations ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Julia set with random parameters
   */
  private static generateJuliaSet(data: Uint8ClampedArray, resolution: Resolution): void {
    const maxIterations = 80 + Math.floor(Math.random() * 120);
    const zoom = 0.5 + Math.random() * 1.5;
    
    // Interesting Julia set parameters
    const juliaParams = [
      { cx: -0.4, cy: 0.6 },
      { cx: 0.285, cy: 0.01 },
      { cx: -0.8, cy: 0.156 },
      { cx: -0.7269, cy: 0.1889 },
      { cx: 0.3, cy: 0.5 },
      { cx: -0.123, cy: 0.745 }
    ];
    
    const params = juliaParams[Math.floor(Math.random() * juliaParams.length)];
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let zx = (x / resolution.width - 0.5) * 4 / zoom;
        let zy = (y / resolution.height - 0.5) * 4 / zoom;
        
        let iterations = 0;
        
        while (iterations < maxIterations && (zx * zx + zy * zy) < 4) {
          const temp = zx * zx - zy * zy + params.cx;
          zy = 2 * zx * zy + params.cy;
          zx = temp;
          iterations++;
        }
        
        const value = iterations < maxIterations ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Burning Ship fractal
   */
  private static generateBurningShip(data: Uint8ClampedArray, resolution: Resolution): void {
    const maxIterations = 100;
    const zoom = 0.5 + Math.random() * 2;
    const offsetX = -1.8 + Math.random() * 0.2;
    const offsetY = -0.08 + Math.random() * 0.16;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        const cx = (x / resolution.width - 0.5) * 4 / zoom + offsetX;
        const cy = (y / resolution.height - 0.5) * 4 / zoom + offsetY;
        
        let zx = 0;
        let zy = 0;
        let iterations = 0;
        
        while (iterations < maxIterations && (zx * zx + zy * zy) < 4) {
          const temp = zx * zx - zy * zy + cx;
          zy = Math.abs(2 * zx * zy) + cy; // The "burning" modification
          zx = temp;
          iterations++;
        }
        
        const value = iterations < maxIterations ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Tricorn (Mandelbar) fractal
   */
  private static generateTricorn(data: Uint8ClampedArray, resolution: Resolution): void {
    const maxIterations = 100;
    const zoom = 0.8 + Math.random() * 1.2;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        const cx = (x / resolution.width - 0.5) * 4 / zoom;
        const cy = (y / resolution.height - 0.5) * 4 / zoom;
        
        let zx = 0;
        let zy = 0;
        let iterations = 0;
        
        while (iterations < maxIterations && (zx * zx + zy * zy) < 4) {
          const temp = zx * zx - zy * zy + cx;
          zy = -2 * zx * zy + cy; // Complex conjugate
          zx = temp;
          iterations++;
        }
        
        const value = iterations < maxIterations ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Sierpinski Triangle using chaos game
   */
  private static generateSierpinskiTriangle(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear the canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    
    // Triangle vertices
    const vertices = [
      { x: resolution.width / 2, y: 10 },
      { x: 10, y: resolution.height - 10 },
      { x: resolution.width - 10, y: resolution.height - 10 }
    ];
    
    // Starting point
    let currentX = Math.random() * resolution.width;
    let currentY = Math.random() * resolution.height;
    
    // Chaos game iterations
    const iterations = Math.min(100000, resolution.width * resolution.height / 10);
    
    for (let i = 0; i < iterations; i++) {
      // Choose random vertex
      const vertex = vertices[Math.floor(Math.random() * 3)];
      
      // Move halfway to the chosen vertex
      currentX = (currentX + vertex.x) / 2;
      currentY = (currentY + vertex.y) / 2;
      
      // Plot the point
      const x = Math.floor(currentX);
      const y = Math.floor(currentY);
      
      if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
        const index = (y * resolution.width + x) * 4;
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
      }
    }
  }

  /**
   * Dragon Curve fractal
   */
  private static generateDragonCurve(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    
    const iterations = Math.min(16, Math.floor(Math.log2(Math.min(resolution.width, resolution.height))) + 2);
    const scale = Math.min(resolution.width, resolution.height) / Math.pow(2, iterations / 2 + 1);
    
    // Generate dragon curve sequence
    let sequence = '1';
    for (let i = 0; i < iterations; i++) {
      let newSequence = '';
      for (let j = 0; j < sequence.length; j++) {
        newSequence += sequence[j];
        if (j < sequence.length - 1) {
          newSequence += ((j % 2) === 0) ? '1' : '0';
        }
      }
      sequence = newSequence;
    }
    
    // Draw the curve
    let x = resolution.width / 2;
    let y = resolution.height / 2;
    let direction = 0; // 0=right, 1=down, 2=left, 3=up
    
    for (let i = 0; i < sequence.length && i < 10000; i++) {
      const turn = sequence[i] === '1' ? 1 : -1; // Right or left turn
      
      // Draw line in current direction
      const dx = [1, 0, -1, 0][direction] * scale;
      const dy = [0, 1, 0, -1][direction] * scale;
      
      const steps = Math.ceil(scale);
      for (let step = 0; step < steps; step++) {
        const plotX = Math.floor(x + (dx * step / steps));
        const plotY = Math.floor(y + (dy * step / steps));
        
        if (plotX >= 0 && plotX < resolution.width && plotY >= 0 && plotY < resolution.height) {
          const index = (plotY * resolution.width + plotX) * 4;
          data[index] = 255;
          data[index + 1] = 255;
          data[index + 2] = 255;
        }
      }
      
      x += dx;
      y += dy;
      direction = (direction + turn + 4) % 4;
    }
  }

  /**
   * Barnsley Fern fractal
   */
  private static generateBarnsleyFern(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    
    let x = 0;
    let y = 0;
    
    const iterations = Math.min(50000, resolution.width * resolution.height / 20);
    
    for (let i = 0; i < iterations; i++) {
      const r = Math.random();
      let newX, newY;
      
      if (r < 0.01) {
        // Stem
        newX = 0;
        newY = 0.16 * y;
      } else if (r < 0.86) {
        // Successively smaller leaflets
        newX = 0.85 * x + 0.04 * y;
        newY = -0.04 * x + 0.85 * y + 1.6;
      } else if (r < 0.93) {
        // Left leaflet
        newX = 0.2 * x - 0.26 * y;
        newY = 0.23 * x + 0.22 * y + 1.6;
      } else {
        // Right leaflet
        newX = -0.15 * x + 0.28 * y;
        newY = 0.26 * x + 0.24 * y + 0.44;
      }
      
      x = newX;
      y = newY;
      
      // Map to screen coordinates
      const screenX = Math.floor((x + 3) * resolution.width / 6);
      const screenY = Math.floor(resolution.height - y * resolution.height / 12);
      
      if (screenX >= 0 && screenX < resolution.width && screenY >= 0 && screenY < resolution.height) {
        const index = (screenY * resolution.width + screenX) * 4;
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
      }
    }
  }
}
