import type { Resolution } from '../../imageGenerator';

export class MarblePattern {
  /**
   * Generates sophisticated marble patterns with realistic veining and color variations
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const marbleType = Math.floor(Math.random() * 4);
    
    switch (marbleType) {
      case 0:
        this.generateCarraraMarble(data, resolution);
        break;
      case 1:
        this.generateCalacattaMarble(data, resolution);
        break;
      case 2:
        this.generateEmperador(data, resolution);
        break;
      case 3:
        this.generateStarGalaxyMarble(data, resolution);
        break;
    }
  }

  /**
   * Classic white Carrara marble with gray veining
   */
  private static generateCarraraMarble(data: Uint8ClampedArray, resolution: Resolution): void {
    // Base white color with slight variations
    const baseColor = {
      r: 245 + Math.floor(Math.random() * 10),
      g: 245 + Math.floor(Math.random() * 10),
      b: 245 + Math.floor(Math.random() * 10)
    };
    
    // Fill with base color
    for (let i = 0; i < data.length; i += 4) {
      data[i] = baseColor.r;
      data[i + 1] = baseColor.g;
      data[i + 2] = baseColor.b;
      data[i + 3] = 255;
    }
    
    // Add primary veining system
    this.addVeiningSystem(data, resolution, {
      numVeins: 3 + Math.floor(Math.random() * 5),
      veinColor: { r: 120, g: 130, b: 140 },
      veinWidth: 2 + Math.random() * 4,
      opacity: 0.6 + Math.random() * 0.3,
      tortuosity: 0.3 + Math.random() * 0.4
    });
    
    // Add secondary finer veining
    this.addVeiningSystem(data, resolution, {
      numVeins: 8 + Math.floor(Math.random() * 12),
      veinColor: { r: 180, g: 185, b: 190 },
      veinWidth: 0.5 + Math.random() * 1.5,
      opacity: 0.3 + Math.random() * 0.2,
      tortuosity: 0.6 + Math.random() * 0.5
    });
    
    // Add subtle crystalline structure
    this.addCrystallineTexture(data, resolution, 0.1);
  }

  /**
   * Calacatta marble with bold dramatic veining
   */
  private static generateCalacattaMarble(data: Uint8ClampedArray, resolution: Resolution): void {
    // Slightly warmer white base
    const baseColor = {
      r: 250 + Math.floor(Math.random() * 5),
      g: 248 + Math.floor(Math.random() * 7),
      b: 245 + Math.floor(Math.random() * 10)
    };
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = baseColor.r;
      data[i + 1] = baseColor.g;
      data[i + 2] = baseColor.b;
      data[i + 3] = 255;
    }
    
    // Bold primary veins with gold hints
    this.addVeiningSystem(data, resolution, {
      numVeins: 2 + Math.floor(Math.random() * 3),
      veinColor: { r: 140, g: 130, b: 120 },
      veinWidth: 5 + Math.random() * 10,
      opacity: 0.7 + Math.random() * 0.2,
      tortuosity: 0.2 + Math.random() * 0.3
    });
    
    // Add gold veining
    this.addVeiningSystem(data, resolution, {
      numVeins: 1 + Math.floor(Math.random() * 2),
      veinColor: { r: 180, g: 160, b: 120 },
      veinWidth: 1 + Math.random() * 3,
      opacity: 0.4 + Math.random() * 0.3,
      tortuosity: 0.8 + Math.random() * 0.4
    });
  }

  /**
   * Dark Emperador marble with fossil-like patterns
   */
  private static generateEmperador(data: Uint8ClampedArray, resolution: Resolution): void {
    // Dark brown base
    const baseColor = {
      r: 80 + Math.floor(Math.random() * 40),
      g: 60 + Math.floor(Math.random() * 30),
      b: 40 + Math.floor(Math.random() * 20)
    };
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = baseColor.r;
      data[i + 1] = baseColor.g;
      data[i + 2] = baseColor.b;
      data[i + 3] = 255;
    }
    
    // Light veining
    this.addVeiningSystem(data, resolution, {
      numVeins: 4 + Math.floor(Math.random() * 6),
      veinColor: { r: 180, g: 160, b: 140 },
      veinWidth: 1 + Math.random() * 3,
      opacity: 0.5 + Math.random() * 0.3,
      tortuosity: 0.4 + Math.random() * 0.5
    });
    
    // Add fossil-like circular patterns
    this.addFossilPatterns(data, resolution);
  }

  /**
   * Star Galaxy marble with metallic specks
   */
  private static generateStarGalaxyMarble(data: Uint8ClampedArray, resolution: Resolution): void {
    // Very dark base
    const baseColor = {
      r: 20 + Math.floor(Math.random() * 20),
      g: 20 + Math.floor(Math.random() * 20),
      b: 25 + Math.floor(Math.random() * 25)
    };
    
    for (let i = 0; i < data.length; i += 4) {
      data[i] = baseColor.r;
      data[i + 1] = baseColor.g;
      data[i + 2] = baseColor.b;
      data[i + 3] = 255;
    }
    
    // Minimal veining
    this.addVeiningSystem(data, resolution, {
      numVeins: 1 + Math.floor(Math.random() * 3),
      veinColor: { r: 80, g: 80, b: 90 },
      veinWidth: 0.5 + Math.random() * 1,
      opacity: 0.3 + Math.random() * 0.2,
      tortuosity: 0.6 + Math.random() * 0.6
    });
    
    // Add metallic specks
    this.addMetallicSpecks(data, resolution);
  }

  /**
   * Add complex veining system
   */
  private static addVeiningSystem(data: Uint8ClampedArray, resolution: Resolution, config: any): void {
    for (let vein = 0; vein < config.numVeins; vein++) {
      // Random start and end points
      const startX = Math.random() * resolution.width;
      const startY = Math.random() * resolution.height;
      const endX = Math.random() * resolution.width;
      const endY = Math.random() * resolution.height;
      
      // Create curved path using multiple control points
      const controlPoints = [];
      const numControls = 3 + Math.floor(Math.random() * 4);
      
      for (let i = 0; i <= numControls + 1; i++) {
        const t = i / (numControls + 1);
        const baseX = startX + (endX - startX) * t;
        const baseY = startY + (endY - startY) * t;
        
        // Add random offset for tortuosity
        const offsetX = (Math.random() - 0.5) * resolution.width * config.tortuosity * 0.3;
        const offsetY = (Math.random() - 0.5) * resolution.height * config.tortuosity * 0.3;
        
        controlPoints.push({ x: baseX + offsetX, y: baseY + offsetY });
      }
      
      // Draw vein along the path
      this.drawVeinPath(data, resolution, controlPoints, config);
    }
  }

  /**
   * Draw a single vein along a path
   */
  private static drawVeinPath(data: Uint8ClampedArray, resolution: Resolution, controlPoints: any[], config: any): void {
    const steps = Math.floor(Math.sqrt(resolution.width * resolution.height) / 2);
    
    for (let step = 0; step < steps; step++) {
      const t = step / (steps - 1);
      
      // Interpolate position along path
      const pos = this.interpolatePath(controlPoints, t);
      
      if (pos.x >= 0 && pos.x < resolution.width && pos.y >= 0 && pos.y < resolution.height) {
        // Variable width along the vein
        const widthVariation = 0.5 + Math.sin(t * Math.PI * 3 + Math.random() * Math.PI) * 0.3;
        const currentWidth = config.veinWidth * widthVariation;
        
        // Draw vein cross-section
        for (let dy = -currentWidth; dy <= currentWidth; dy++) {
          for (let dx = -currentWidth; dx <= currentWidth; dx++) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= currentWidth) {
              const x = Math.floor(pos.x + dx);
              const y = Math.floor(pos.y + dy);
              
              if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
                const index = (y * resolution.width + x) * 4;
                
                // Smooth edge falloff
                const edgeFalloff = Math.max(0, 1 - distance / currentWidth);
                const alpha = config.opacity * edgeFalloff;
                
                // Blend colors
                data[index] = Math.floor(data[index] * (1 - alpha) + config.veinColor.r * alpha);
                data[index + 1] = Math.floor(data[index + 1] * (1 - alpha) + config.veinColor.g * alpha);
                data[index + 2] = Math.floor(data[index + 2] * (1 - alpha) + config.veinColor.b * alpha);
              }
            }
          }
        }
      }
    }
  }

  /**
   * Interpolate position along control point path
   */
  private static interpolatePath(points: any[], t: number): { x: number, y: number } {
    if (points.length < 2) return points[0] || { x: 0, y: 0 };
    
    const scaledT = t * (points.length - 1);
    const index = Math.floor(scaledT);
    const localT = scaledT - index;
    
    if (index >= points.length - 1) return points[points.length - 1];
    
    const p1 = points[index];
    const p2 = points[index + 1];
    
    return {
      x: p1.x + (p2.x - p1.x) * localT,
      y: p1.y + (p2.y - p1.y) * localT
    };
  }

  /**
   * Add crystalline texture
   */
  private static addCrystallineTexture(data: Uint8ClampedArray, resolution: Resolution, intensity: number): void {
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Create subtle crystalline noise
        const noise = this.fbmNoise(x * 0.01, y * 0.01, 3) * intensity;
        
        data[index] = Math.max(0, Math.min(255, data[index] + noise * 20));
        data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + noise * 20));
        data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + noise * 20));
      }
    }
  }

  /**
   * Add fossil-like circular patterns
   */
  private static addFossilPatterns(data: Uint8ClampedArray, resolution: Resolution): void {
    const numFossils = 2 + Math.floor(Math.random() * 5);
    
    for (let fossil = 0; fossil < numFossils; fossil++) {
      const centerX = Math.random() * resolution.width;
      const centerY = Math.random() * resolution.height;
      const radius = 20 + Math.random() * 50;
      
      for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
        const spiralRadius = radius * (0.5 + 0.5 * Math.sin(angle * 3));
        const x = Math.floor(centerX + Math.cos(angle) * spiralRadius);
        const y = Math.floor(centerY + Math.sin(angle) * spiralRadius);
        
        if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
          const index = (y * resolution.width + x) * 4;
          
          data[index] = Math.min(255, data[index] + 40);
          data[index + 1] = Math.min(255, data[index + 1] + 35);
          data[index + 2] = Math.min(255, data[index + 2] + 30);
        }
      }
    }
  }

  /**
   * Add metallic specks for galaxy marble
   */
  private static addMetallicSpecks(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSpecks = Math.floor(resolution.width * resolution.height * 0.001);
    
    for (let speck = 0; speck < numSpecks; speck++) {
      const x = Math.floor(Math.random() * resolution.width);
      const y = Math.floor(Math.random() * resolution.height);
      const size = Math.random() < 0.9 ? 1 : 2;
      const brightness = 150 + Math.floor(Math.random() * 105);
      
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const speckX = x + dx;
          const speckY = y + dy;
          
          if (speckX >= 0 && speckX < resolution.width && speckY >= 0 && speckY < resolution.height) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= size) {
              const index = (speckY * resolution.width + speckX) * 4;
              const intensity = brightness * Math.exp(-distance);
              
              // Golden metallic color
              data[index] = Math.min(255, data[index] + intensity * 0.8);
              data[index + 1] = Math.min(255, data[index + 1] + intensity * 0.7);
              data[index + 2] = Math.min(255, data[index + 2] + intensity * 0.3);
            }
          }
        }
      }
    }
  }

  /**
   * Fractal Brownian Motion noise
   */
  private static fbmNoise(x: number, y: number, octaves: number): number {
    let value = 0;
    let amplitude = 1;
    let frequency = 1;
    
    for (let i = 0; i < octaves; i++) {
      value += amplitude * this.simpleNoise(x * frequency, y * frequency);
      frequency *= 2;
      amplitude *= 0.5;
    }
    
    return value;
  }

  /**
   * Simple noise function
   */
  private static simpleNoise(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return (n - Math.floor(n)) * 2 - 1;
  }
}
