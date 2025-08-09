import type { Resolution } from '../../imageGenerator';

export class LightningPattern {
  /**
   * Generates lightning/crack patterns using diffusion-limited aggregation
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize all pixels to black
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    const numBolts = 3 + Math.floor(Math.random() * 5);
    
    for (let bolt = 0; bolt < numBolts; bolt++) {
      // Start from random edge
      let startX = Math.random() < 0.5 ? 0 : resolution.width - 1;
      let startY = Math.floor(Math.random() * resolution.height);
      
      // Target opposite side
      const targetX = startX === 0 ? resolution.width - 1 : 0;
      const targetY = Math.floor(Math.random() * resolution.height);
      
      // Generate lightning path using random walk with bias
      let currentX = startX;
      let currentY = startY;
      const visited = new Set<string>();
      
      while (Math.abs(currentX - targetX) > 5 || Math.abs(currentY - targetY) > 5) {
        const key = `${currentX},${currentY}`;
        if (visited.has(key)) break;
        visited.add(key);
        
        // Draw current position
        const index = (currentY * resolution.width + currentX) * 4;
        if (index >= 0 && index < data.length) {
          data[index] = 255;
          data[index + 1] = 255;
          data[index + 2] = 255;
          
          // Add some thickness
          for (let dy = -1; dy <= 1; dy++) {
            for (let dx = -1; dx <= 1; dx++) {
              const nx = currentX + dx;
              const ny = currentY + dy;
              if (nx >= 0 && nx < resolution.width && ny >= 0 && ny < resolution.height) {
                const nIndex = (ny * resolution.width + nx) * 4;
                if (Math.random() > 0.3) {
                  data[nIndex] = 255;
                  data[nIndex + 1] = 255;
                  data[nIndex + 2] = 255;
                }
              }
            }
          }
        }
        
        // Move towards target with some randomness
        const dx = targetX - currentX;
        const dy = targetY - currentY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        if (distance > 0) {
          const biasStrength = 0.7;
          const randomStrength = 1 - biasStrength;
          
          const moveX = (dx / distance) * biasStrength + (Math.random() - 0.5) * randomStrength;
          const moveY = (dy / distance) * biasStrength + (Math.random() - 0.5) * randomStrength;
          
          currentX = Math.max(0, Math.min(resolution.width - 1, Math.round(currentX + moveX * 3)));
          currentY = Math.max(0, Math.min(resolution.height - 1, Math.round(currentY + moveY * 3)));
        }
      }
    }
  }
}
