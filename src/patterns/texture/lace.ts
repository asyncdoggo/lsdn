import type { Resolution } from '../../imageGenerator';

export class LacePattern {
  /**
   * Generates optimized lace patterns with performance improvements
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    // Scale grid size based on resolution to prevent performance issues
    const baseGridSize = Math.max(30, Math.min(80, Math.floor(Math.sqrt(resolution.width * resolution.height) / 50)));
    const gridSize = baseGridSize + Math.floor(Math.random() * 20);
    const numCellsX = Math.floor(resolution.width / gridSize);
    const numCellsY = Math.floor(resolution.height / gridSize);
    
    // Limit the number of cells to prevent browser crashes
    const maxCells = 400; // Reasonable limit
    if (numCellsX * numCellsY > maxCells) {
      // Use simpler pattern for very high resolutions
      this.generateSimpleLacePattern(data, resolution);
      return;
    }
    
    // Create lace pattern with varied motifs
    for (let cellY = 0; cellY < numCellsY; cellY++) {
      for (let cellX = 0; cellX < numCellsX; cellX++) {
        const centerX = cellX * gridSize + gridSize / 2;
        const centerY = cellY * gridSize + gridSize / 2;
        
        const patternType = Math.floor(Math.random() * 3); // Reduced to faster patterns
        
        switch (patternType) {
          case 0:
            this.drawSimpleCross(data, resolution, centerX, centerY, gridSize * 0.3);
            break;
          case 1:
            this.drawSimpleDiamond(data, resolution, centerX, centerY, gridSize * 0.25);
            break;
          case 2:
            this.drawSimpleCircle(data, resolution, centerX, centerY, gridSize * 0.2);
            break;
        }
        
        // Reduce connecting elements for performance
        if (Math.random() > 0.7) {
          if (cellX < numCellsX - 1) {
            const nextX = (cellX + 1) * gridSize + gridSize / 2;
            this.drawStraightLine(data, resolution, centerX + 8, centerY, nextX - 8, centerY);
          }
          
          if (cellY < numCellsY - 1) {
            const nextY = (cellY + 1) * gridSize + gridSize / 2;
            this.drawStraightLine(data, resolution, centerX, centerY + 8, centerX, nextY - 8);
          }
        }
      }
    }
  }

  /**
   * Generates a simplified lace pattern for high resolutions
   */
  private static generateSimpleLacePattern(data: Uint8ClampedArray, resolution: Resolution): void {
    const spacing = Math.max(40, Math.floor(Math.sqrt(resolution.width * resolution.height) / 30));
    
    // Create a simple grid pattern
    for (let y = spacing; y < resolution.height; y += spacing) {
      for (let x = spacing; x < resolution.width; x += spacing) {
        // Simple cross pattern
        this.drawStraightLine(data, resolution, x - 10, y, x + 10, y);
        this.drawStraightLine(data, resolution, x, y - 10, x, y + 10);
      }
    }
  }

  private static drawSimpleCross(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, size: number): void {
    this.drawStraightLine(data, resolution, centerX - size, centerY, centerX + size, centerY);
    this.drawStraightLine(data, resolution, centerX, centerY - size, centerX, centerY + size);
  }

  private static drawSimpleDiamond(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, size: number): void {
    this.drawStraightLine(data, resolution, centerX - size, centerY, centerX, centerY - size);
    this.drawStraightLine(data, resolution, centerX, centerY - size, centerX + size, centerY);
    this.drawStraightLine(data, resolution, centerX + size, centerY, centerX, centerY + size);
    this.drawStraightLine(data, resolution, centerX, centerY + size, centerX - size, centerY);
  }

  private static drawSimpleCircle(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    // Optimized circle using Bresenham-like algorithm
    const radiusInt = Math.round(radius);
    let x = radiusInt;
    let y = 0;
    let decisionOver2 = 1 - x;

    while (y <= x) {
      this.setPixel(data, resolution, Math.round(centerX + x), Math.round(centerY + y));
      this.setPixel(data, resolution, Math.round(centerX + y), Math.round(centerY + x));
      this.setPixel(data, resolution, Math.round(centerX - x), Math.round(centerY + y));
      this.setPixel(data, resolution, Math.round(centerX - y), Math.round(centerY + x));
      this.setPixel(data, resolution, Math.round(centerX - x), Math.round(centerY - y));
      this.setPixel(data, resolution, Math.round(centerX - y), Math.round(centerY - x));
      this.setPixel(data, resolution, Math.round(centerX + x), Math.round(centerY - y));
      this.setPixel(data, resolution, Math.round(centerX + y), Math.round(centerY - x));
      
      y++;
      if (decisionOver2 <= 0) {
        decisionOver2 += 2 * y + 1;
      } else {
        x--;
        decisionOver2 += 2 * (y - x) + 1;
      }
    }
  }

  private static drawStraightLine(data: Uint8ClampedArray, resolution: Resolution, x1: number, y1: number, x2: number, y2: number): void {
    // Optimized Bresenham line algorithm
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    let x = Math.round(x1);
    let y = Math.round(y1);
    const endX = Math.round(x2);
    const endY = Math.round(y2);
    
    // Limit iterations to prevent infinite loops
    let iterations = 0;
    const maxIterations = Math.max(dx, dy) + 1;
    
    while (iterations < maxIterations) {
      this.setPixel(data, resolution, x, y);
      
      if (x === endX && y === endY) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
      iterations++;
    }
  }

  private static setPixel(data: Uint8ClampedArray, resolution: Resolution, x: number, y: number): void {
    if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
      const index = (y * resolution.width + x) * 4;
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
    }
  }
}
