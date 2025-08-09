import type { Resolution } from '../../imageGenerator';

export class LacePattern {
  /**
   * Generates balanced lace patterns with various motifs
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const gridSize = 50 + Math.floor(Math.random() * 30);
    const numCellsX = Math.floor(resolution.width / gridSize);
    const numCellsY = Math.floor(resolution.height / gridSize);
    
    // Create lace pattern with varied motifs
    for (let cellY = 0; cellY < numCellsY; cellY++) {
      for (let cellX = 0; cellX < numCellsX; cellX++) {
        const centerX = cellX * gridSize + gridSize / 2;
        const centerY = cellY * gridSize + gridSize / 2;
        
        const patternType = Math.floor(Math.random() * 5);
        
        switch (patternType) {
          case 0:
            this.drawLaceFlower(data, resolution, centerX, centerY, gridSize * 0.25);
            break;
          case 1:
            this.drawDecorativeCross(data, resolution, centerX, centerY, gridSize * 0.3);
            break;
          case 2:
            this.drawDoubleDiamond(data, resolution, centerX, centerY, gridSize * 0.2);
            break;
          case 3:
            this.drawSimpleStar(data, resolution, centerX, centerY, gridSize * 0.25);
            break;
          case 4:
            this.drawHexagonLace(data, resolution, centerX, centerY, gridSize * 0.22);
            break;
        }
        
        // Add connecting elements
        if (Math.random() > 0.5) {
          if (cellX < numCellsX - 1) {
            const nextX = (cellX + 1) * gridSize + gridSize / 2;
            this.drawWavyLine(data, resolution, centerX + 12, centerY, nextX - 12, centerY);
          }
          
          if (cellY < numCellsY - 1) {
            const nextY = (cellY + 1) * gridSize + gridSize / 2;
            this.drawWavyLine(data, resolution, centerX, centerY + 12, centerX, nextY - 12);
          }
        }
      }
    }
  }

  private static drawLaceFlower(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const petals = 6;
    for (let i = 0; i < petals; i++) {
      const angle = (i * Math.PI * 2) / petals;
      const petalX = centerX + Math.cos(angle) * radius;
      const petalY = centerY + Math.sin(angle) * radius;
      this.drawCircle(data, resolution, petalX, petalY, radius * 0.4);
    }
    this.drawCircle(data, resolution, centerX, centerY, radius * 0.3);
  }

  private static drawDecorativeCross(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, size: number): void {
    this.drawLine(data, resolution, centerX - size, centerY, centerX + size, centerY);
    this.drawLine(data, resolution, centerX, centerY - size, centerX, centerY + size);
    
    // Add decorative ends
    this.drawCircle(data, resolution, centerX - size, centerY, size * 0.2);
    this.drawCircle(data, resolution, centerX + size, centerY, size * 0.2);
    this.drawCircle(data, resolution, centerX, centerY - size, size * 0.2);
    this.drawCircle(data, resolution, centerX, centerY + size, size * 0.2);
  }

  private static drawDoubleDiamond(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, size: number): void {
    // Outer diamond
    this.drawLine(data, resolution, centerX - size, centerY, centerX, centerY - size);
    this.drawLine(data, resolution, centerX, centerY - size, centerX + size, centerY);
    this.drawLine(data, resolution, centerX + size, centerY, centerX, centerY + size);
    this.drawLine(data, resolution, centerX, centerY + size, centerX - size, centerY);
    
    // Inner diamond
    const innerSize = size * 0.5;
    this.drawLine(data, resolution, centerX - innerSize, centerY, centerX, centerY - innerSize);
    this.drawLine(data, resolution, centerX, centerY - innerSize, centerX + innerSize, centerY);
    this.drawLine(data, resolution, centerX + innerSize, centerY, centerX, centerY + innerSize);
    this.drawLine(data, resolution, centerX, centerY + innerSize, centerX - innerSize, centerY);
  }

  private static drawSimpleStar(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const points = 8;
    for (let i = 0; i < points; i++) {
      const angle = (i * Math.PI * 2) / points;
      const pointX = centerX + Math.cos(angle) * radius;
      const pointY = centerY + Math.sin(angle) * radius;
      this.drawLine(data, resolution, centerX, centerY, pointX, pointY);
    }
  }

  private static drawHexagonLace(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const points = 6;
    for (let i = 0; i < points; i++) {
      const angle1 = (i * Math.PI * 2) / points;
      const angle2 = ((i + 1) * Math.PI * 2) / points;
      
      const x1 = centerX + Math.cos(angle1) * radius;
      const y1 = centerY + Math.sin(angle1) * radius;
      const x2 = centerX + Math.cos(angle2) * radius;
      const y2 = centerY + Math.sin(angle2) * radius;
      
      this.drawLine(data, resolution, x1, y1, x2, y2);
    }
    this.drawCircle(data, resolution, centerX, centerY, radius * 0.3);
  }

  private static drawWavyLine(data: Uint8ClampedArray, resolution: Resolution, x1: number, y1: number, x2: number, y2: number): void {
    const steps = Math.max(Math.abs(x2 - x1), Math.abs(y2 - y1));
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t;
      const y = y1 + (y2 - y1) * t + Math.sin(t * Math.PI * 3) * 3;
      this.setPixel(data, resolution, Math.round(x), Math.round(y));
    }
  }

  private static drawCircle(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const x = Math.round(centerX + Math.cos(angle) * radius);
      const y = Math.round(centerY + Math.sin(angle) * radius);
      this.setPixel(data, resolution, x, y);
    }
  }

  private static drawLine(data: Uint8ClampedArray, resolution: Resolution, x1: number, y1: number, x2: number, y2: number): void {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    let x = Math.round(x1);
    let y = Math.round(y1);
    const endX = Math.round(x2);
    const endY = Math.round(y2);
    
    while (true) {
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
