import type { Resolution } from '../../imageGenerator';

export class PerlinNoisePattern {
  /**
   * Simple noise function for Perlin-like patterns
   */
  private static simpleNoise(x: number, y: number): number {
    return (
      Math.sin(x + Math.sin(y * 1.3) * 0.5) + 
      Math.sin(y + Math.sin(x * 1.1) * 0.7) + 
      Math.sin((x + y) * 0.7) * 0.3
    ) / 3;
  }

  /**
   * Generates a simple Perlin-like noise pattern
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const scale = 0.005 + Math.random() * 0.01; // Variable scale for different patterns
    const octaves = 3;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let noise = 0;
        let amplitude = 1;
        let frequency = scale;
        
        // Multiple octaves for more complex noise
        for (let i = 0; i < octaves; i++) {
          noise += PerlinNoisePattern.simpleNoise(x * frequency, y * frequency) * amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }
        
        const value = noise > 0 ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }
}
