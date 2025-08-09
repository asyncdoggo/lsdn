import type { Resolution } from '../../imageGenerator';

export class CrystalPattern {
  /**
   * Generates crystal/geometric crystal patterns
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const numCrystals = 8 + Math.floor(Math.random() * 15);
    
    for (let crystal = 0; crystal < numCrystals; crystal++) {
      const centerX = Math.random() * resolution.width;
      const centerY = Math.random() * resolution.height;
      const size = 30 + Math.random() * 100;
      const numFaces = 6 + Math.floor(Math.random() * 6);
      const rotation = Math.random() * Math.PI * 2;
      
      // Generate crystal vertices
      const vertices: [number, number][] = [];
      for (let i = 0; i < numFaces; i++) {
        const angle = (i / numFaces) * Math.PI * 2 + rotation;
        const radius = size * (0.7 + Math.random() * 0.6); // Vary radius for irregular crystals
        vertices.push([
          centerX + Math.cos(angle) * radius,
          centerY + Math.sin(angle) * radius
        ]);
      }
      
      // Draw crystal outline
      for (let i = 0; i < numFaces; i++) {
        const [x1, y1] = vertices[i];
        const [x2, y2] = vertices[(i + 1) % numFaces];
        this.drawLine(data, resolution, Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), 2);
      }
      
      // Add internal crystal structure
      for (let i = 0; i < numFaces; i++) {
        if (Math.random() > 0.6) {
          const [x1, y1] = vertices[i];
          this.drawLine(data, resolution, Math.round(centerX), Math.round(centerY), Math.round(x1), Math.round(y1), 1);
        }
      }
    }
  }

  private static drawLine(data: Uint8ClampedArray, resolution: Resolution, x1: number, y1: number, x2: number, y2: number, thickness: number): void {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    let x = x1;
    let y = y1;
    
    while (true) {
      // Draw with thickness
      for (let ty = -thickness; ty <= thickness; ty++) {
        for (let tx = -thickness; tx <= thickness; tx++) {
          const px = x + tx;
          const py = y + ty;
          
          if (px >= 0 && px < resolution.width && py >= 0 && py < resolution.height) {
            if (tx * tx + ty * ty <= thickness * thickness) {
              const index = (py * resolution.width + px) * 4;
              data[index] = 0;
              data[index + 1] = 0;
              data[index + 2] = 0;
            }
          }
        }
      }
      
      if (x === x2 && y === y2) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }
}
