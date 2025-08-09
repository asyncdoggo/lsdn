import type { Resolution } from '../../imageGenerator';

export class MazePattern {
  /**
   * Generates a maze-like pattern using simple grid-based generation
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const cellSize = Math.max(4, Math.floor(Math.min(resolution.width, resolution.height) / 100));
    const mazeWidth = Math.floor(resolution.width / cellSize);
    const mazeHeight = Math.floor(resolution.height / cellSize);
    
    // Initialize to black (walls)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }
    
    // Create maze grid (walls = 0, paths = 1)
    const maze = Array(mazeHeight).fill(null).map(() => Array(mazeWidth).fill(0));
    
    // Simple maze generation - create random paths
    for (let y = 1; y < mazeHeight - 1; y += 2) {
      for (let x = 1; x < mazeWidth - 1; x += 2) {
        maze[y][x] = 1; // Create room
        
        // Add random corridors
        if (Math.random() > 0.5 && x + 2 < mazeWidth - 1) {
          maze[y][x + 1] = 1; // Horizontal corridor
        }
        if (Math.random() > 0.5 && y + 2 < mazeHeight - 1) {
          maze[y + 1][x] = 1; // Vertical corridor
        }
      }
    }
    
    // Ensure connectivity by adding some random paths
    for (let i = 0; i < mazeWidth * mazeHeight * 0.1; i++) {
      const x = Math.floor(Math.random() * mazeWidth);
      const y = Math.floor(Math.random() * mazeHeight);
      maze[y][x] = 1;
    }
    
    // Render maze to pixel data
    for (let y = 0; y < mazeHeight; y++) {
      for (let x = 0; x < mazeWidth; x++) {
        if (maze[y][x] === 1) {
          // Draw path (white)
          for (let py = 0; py < cellSize; py++) {
            for (let px = 0; px < cellSize; px++) {
              const pixelX = x * cellSize + px;
              const pixelY = y * cellSize + py;
              
              if (pixelX < resolution.width && pixelY < resolution.height) {
                const index = (pixelY * resolution.width + pixelX) * 4;
                data[index] = 255;     // R
                data[index + 1] = 255; // G
                data[index + 2] = 255; // B
              }
            }
          }
        }
      }
    }
  }
}
