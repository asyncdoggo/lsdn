import type { Resolution } from '../../imageGenerator';

export class MandalaPattern {
  /**
   * Generates mandala patterns
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const centerX = resolution.width / 2;
    const centerY = resolution.height / 2;
    const maxRadius = Math.min(resolution.width, resolution.height) * 0.4;
    const numLayers = 5 + Math.floor(Math.random() * 8);
    const symmetryOrder = 6 + Math.floor(Math.random() * 6); // 6-12 fold symmetry
    
    for (let layer = 0; layer < numLayers; layer++) {
      const radius = (layer + 1) * (maxRadius / numLayers);
      const layerPattern = Math.floor(Math.random() * 4); // Different pattern types per layer
      
      for (let i = 0; i < symmetryOrder; i++) {
        const angle = (i / symmetryOrder) * Math.PI * 2;
        
        switch (layerPattern) {
          case 0: // Dots
            const dotX = centerX + Math.cos(angle) * radius;
            const dotY = centerY + Math.sin(angle) * radius;
            this.fillCircle(data, resolution, dotX, dotY, 3 + Math.random() * 5);
            break;
            
          case 1: // Petals
            for (let petal = 0; petal < 3; petal++) {
              const petalAngle = angle + (petal - 1) * 0.2;
              const petalRadius = radius * (0.8 + Math.random() * 0.4);
              const x1 = centerX + Math.cos(petalAngle) * (radius * 0.7);
              const y1 = centerY + Math.sin(petalAngle) * (radius * 0.7);
              const x2 = centerX + Math.cos(petalAngle) * petalRadius;
              const y2 = centerY + Math.sin(petalAngle) * petalRadius;
              this.drawLine(data, resolution, Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), 2);
            }
            break;
            
          case 2: // Triangles
            const triSize = 10 + Math.random() * 15;
            const triX = centerX + Math.cos(angle) * radius;
            const triY = centerY + Math.sin(angle) * radius;
            for (let tri = 0; tri < 3; tri++) {
              const triAngle = (tri / 3) * Math.PI * 2;
              const x1 = triX + Math.cos(triAngle) * triSize;
              const y1 = triY + Math.sin(triAngle) * triSize;
              const x2 = triX + Math.cos(triAngle + Math.PI * 2 / 3) * triSize;
              const y2 = triY + Math.sin(triAngle + Math.PI * 2 / 3) * triSize;
              this.drawLine(data, resolution, Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), 1);
            }
            break;
            
          case 3: // Rays
            const rayLength = radius * (0.3 + Math.random() * 0.4);
            const x1 = centerX + Math.cos(angle) * (radius - rayLength);
            const y1 = centerY + Math.sin(angle) * (radius - rayLength);
            const x2 = centerX + Math.cos(angle) * (radius + rayLength * 0.5);
            const y2 = centerY + Math.sin(angle) * (radius + rayLength * 0.5);
            this.drawLine(data, resolution, Math.round(x1), Math.round(y1), Math.round(x2), Math.round(y2), 2);
            break;
        }
      }
      
      // Draw concentric circles
      if (layer % 2 === 0) {
        this.drawCircle(data, resolution, centerX, centerY, radius, 1);
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

  private static fillCircle(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const r = Math.round(radius);
    
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
          const dx = x - cx;
          const dy = y - cy;
          if (dx * dx + dy * dy <= r * r) {
            const index = (y * resolution.width + x) * 4;
            data[index] = 0;
            data[index + 1] = 0;
            data[index + 2] = 0;
          }
        }
      }
    }
  }

  private static drawCircle(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number, thickness: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const r = Math.round(radius);
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
      const x = Math.round(cx + Math.cos(angle) * r);
      const y = Math.round(cy + Math.sin(angle) * r);
      
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
    }
  }
}
