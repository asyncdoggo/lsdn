import type { Resolution } from '../../imageGenerator';

export class CellularPattern {
  /**
   * Generates a cellular automata-like pattern
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initial random seed
    const grid = new Array(resolution.height);
    for (let y = 0; y < resolution.height; y++) {
      grid[y] = new Array(resolution.width);
      for (let x = 0; x < resolution.width; x++) {
        grid[y][x] = Math.random() > 0.55; // Slightly biased towards white
      }
    }

    // Apply cellular automata rules (simplified)
    for (let iteration = 0; iteration < 3; iteration++) {
      const newGrid = grid.map(row => [...row]);
      
      for (let y = 1; y < resolution.height - 1; y++) {
        for (let x = 1; x < resolution.width - 1; x++) {
          let neighbors = 0;
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              if (dx === 0 && dy === 0) continue;
              if (grid[y + dy][x + dx]) neighbors++;
            }
          }
          newGrid[y][x] = neighbors >= 4;
        }
      }
      
      grid.splice(0, grid.length, ...newGrid);
    }

    // Convert grid to image data
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        const value = grid[y][x] ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }
}
