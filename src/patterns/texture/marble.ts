import type { Resolution } from '../../imageGenerator';

export class MarblePattern {
  /**
   * Generates marble-like veining patterns
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const scale = 0.002 + Math.random() * 0.004;
    const veinStrength = 2 + Math.random() * 3;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Create base marble pattern
        let marble = 0;
        let frequency = scale;
        let amplitude = 1;
        
        for (let i = 0; i < 3; i++) {
          marble += this.simpleNoise(x * frequency, y * frequency) * amplitude;
          frequency *= 2;
          amplitude *= 0.5;
        }
        
        // Add veining
        const vein = Math.sin(x * scale * veinStrength + marble * 10) * 
                    Math.sin(y * scale * veinStrength + marble * 8);
        
        const finalPattern = marble + vein * 0.5;
        const value = finalPattern > 0 ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Simple noise function for texture patterns
   */
  private static simpleNoise(x: number, y: number): number {
    return (
      Math.sin(x + Math.sin(y * 1.3) * 0.5) + 
      Math.sin(y + Math.sin(x * 1.1) * 0.7) + 
      Math.sin((x + y) * 0.7) * 0.3
    ) / 3;
  }
}
