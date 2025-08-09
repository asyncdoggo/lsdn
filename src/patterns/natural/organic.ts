import type { Resolution } from '../../imageGenerator';

export class OrganicPattern {
  /**
   * Generates organic growth patterns using a simpler but more reliable algorithm
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    // Create multiple growth centers
    const numCenters = 8 + Math.floor(Math.random() * 12);
    const centers: { x: number; y: number; radius: number }[] = [];
    
    for (let i = 0; i < numCenters; i++) {
      centers.push({
        x: Math.random() * resolution.width,
        y: Math.random() * resolution.height,
        radius: 20 + Math.random() * 80
      });
    }
    
    // Generate organic branching patterns
    for (const center of centers) {
      const numBranches = 5 + Math.floor(Math.random() * 10);
      
      for (let branch = 0; branch < numBranches; branch++) {
        const angle = (branch / numBranches) * Math.PI * 2 + (Math.random() - 0.5) * 0.5;
        const branchLength = center.radius * (0.5 + Math.random() * 0.8);
        
        // Draw main branch
        let currentX = center.x;
        let currentY = center.y;
        const steps = Math.floor(branchLength);
        
        for (let step = 0; step < steps; step++) {
          // Add some organic waviness
          const waveX = Math.sin(step * 0.1) * 5;
          const waveY = Math.cos(step * 0.15) * 3;
          
          const stepX = Math.cos(angle) + waveX * 0.1;
          const stepY = Math.sin(angle) + waveY * 0.1;
          
          currentX += stepX;
          currentY += stepY;
          
          const x = Math.round(currentX);
          const y = Math.round(currentY);
          
          if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
            // Draw with thickness
            const thickness = Math.max(1, Math.floor(3 - (step / steps) * 2));
            
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
            
            // Add sub-branches occasionally
            if (step > 10 && Math.random() > 0.85) {
              const subBranchAngle = angle + (Math.random() - 0.5) * Math.PI * 0.5;
              const subBranchLength = (branchLength - step) * 0.6;
              const subSteps = Math.floor(subBranchLength);
              
              let subX = currentX;
              let subY = currentY;
              
              for (let subStep = 0; subStep < subSteps; subStep++) {
                subX += Math.cos(subBranchAngle) * 0.8;
                subY += Math.sin(subBranchAngle) * 0.8;
                
                const sx = Math.round(subX);
                const sy = Math.round(subY);
                
                if (sx >= 0 && sx < resolution.width && sy >= 0 && sy < resolution.height) {
                  const subThickness = Math.max(1, Math.floor(2 - (subStep / subSteps) * 1.5));
                  
                  for (let dy = -subThickness; dy <= subThickness; dy++) {
                    for (let dx = -subThickness; dx <= subThickness; dx++) {
                      const px = sx + dx;
                      const py = sy + dy;
                      
                      if (px >= 0 && px < resolution.width && py >= 0 && py < resolution.height) {
                        if (dx * dx + dy * dy <= subThickness * subThickness) {
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
        }
      }
      
      // Draw center node
      const centerThickness = 5 + Math.floor(Math.random() * 8);
      const cx = Math.round(center.x);
      const cy = Math.round(center.y);
      
      for (let dy = -centerThickness; dy <= centerThickness; dy++) {
        for (let dx = -centerThickness; dx <= centerThickness; dx++) {
          const px = cx + dx;
          const py = cy + dy;
          
          if (px >= 0 && px < resolution.width && py >= 0 && py < resolution.height) {
            if (dx * dx + dy * dy <= centerThickness * centerThickness) {
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
