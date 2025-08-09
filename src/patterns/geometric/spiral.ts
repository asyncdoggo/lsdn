import type { Resolution } from '../../imageGenerator';

export class SpiralPattern {
  /**
   * Generates spiral patterns
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
    const numSpirals = 2 + Math.floor(Math.random() * 4);
    const thickness = 3 + Math.floor(Math.random() * 5);
    
    for (let spiral = 0; spiral < numSpirals; spiral++) {
      const angleOffset = (spiral / numSpirals) * Math.PI * 2;
      const spiralTightness = 0.05 + Math.random() * 0.1;
      const maxRadius = Math.min(resolution.width, resolution.height) * 0.4;
      
      for (let angle = 0; angle < Math.PI * 20; angle += 0.02) {
        const radius = (angle * spiralTightness) * (maxRadius / (Math.PI * 20 * spiralTightness));
        if (radius > maxRadius) break;
        
        const x = Math.round(centerX + Math.cos(angle + angleOffset) * radius);
        const y = Math.round(centerY + Math.sin(angle + angleOffset) * radius);
        
        // Draw with thickness
        for (let dy = -thickness; dy <= thickness; dy++) {
          for (let dx = -thickness; dx <= thickness; dx++) {
            const px = x + dx;
            const py = y + dy;
            
            if (px >= 0 && px < resolution.width && py >= 0 && py < resolution.height) {
              if (dx * dx + dy * dy <= thickness * thickness) {
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
}
