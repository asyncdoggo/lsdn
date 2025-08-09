import type { Resolution } from '../../imageGenerator';

export class CloudPattern {
  /**
   * Simple noise function for natural patterns
   */
  private static simpleNoise(x: number, y: number): number {
    return (
      Math.sin(x + Math.sin(y * 1.3) * 0.5) + 
      Math.sin(y + Math.sin(x * 1.1) * 0.7) + 
      Math.sin((x + y) * 0.7) * 0.3
    ) / 3;
  }

  /**
   * Generates cloud-like patterns using turbulent noise
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const scale = 0.003 + Math.random() * 0.005;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Generate turbulent noise
        let noise = 0;
        let amplitude = 1;
        let frequency = scale;
        
        for (let i = 0; i < 4; i++) {
          const nx = x * frequency;
          const ny = y * frequency;
          
          // Turbulence function
          noise += Math.abs(CloudPattern.simpleNoise(nx, ny)) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        // Create cloud-like threshold
        const cloudiness = 0.3 + Math.random() * 0.3;
        const value = noise > cloudiness ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }
}
