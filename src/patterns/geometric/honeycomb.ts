import type { Resolution } from '../../imageGenerator';

export class HoneycombPattern {
  /**
   * Generates honeycomb/hexagonal patterns
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const cellSize = 20 + Math.floor(Math.random() * 40);
    const hexHeight = cellSize * Math.sqrt(3);
    const lineThickness = 2 + Math.floor(Math.random() * 3);
    
    // Draw hexagonal grid
    for (let row = 0; row < Math.ceil(resolution.height / hexHeight) + 1; row++) {
      for (let col = 0; col < Math.ceil(resolution.width / cellSize) + 2; col++) {
        const offsetX = (row % 2) * cellSize * 0.5;
        const centerX = col * cellSize + offsetX;
        const centerY = row * hexHeight * 0.75;
        
        // Draw hexagon outline
        const vertices: [number, number][] = [];
        for (let i = 0; i < 6; i++) {
          const angle = (i * Math.PI) / 3;
          vertices.push([
            centerX + Math.cos(angle) * cellSize * 0.5,
            centerY + Math.sin(angle) * cellSize * 0.5
          ]);
        }
        
        // Draw hexagon edges
        for (let i = 0; i < 6; i++) {
          const [x1, y1] = vertices[i];
          const [x2, y2] = vertices[(i + 1) % 6];
          
          this.drawLine(data, resolution, Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), lineThickness);
        }
        
        // Randomly fill some hexagons
        if (Math.random() > 0.7) {
          this.fillHexagon(data, resolution, centerX, centerY, cellSize * 0.4);
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

  private static fillHexagon(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const r = Math.round(radius);
    
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
          // Check if point is inside hexagon (simplified check)
          const dx = Math.abs(x - cx);
          const dy = Math.abs(y - cy);
          if (dx <= r * 0.866 && dy <= r && dx * 0.5 + dy * 0.866 <= r) {
            const index = (y * resolution.width + x) * 4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
          }
        }
      }
    }
  }
}
