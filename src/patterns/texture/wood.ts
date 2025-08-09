import type { Resolution } from '../../imageGenerator';

export class WoodPattern {
  /**
   * Generates wood grain patterns with tree rings
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const centerX = resolution.width / 2;
    const centerY = resolution.height / 2;
    const ringFrequency = 0.1 + Math.random() * 0.2;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Distance from center (tree rings)
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        
        // Add some noise for irregularity
        const noise = this.simpleNoise(x * 0.01, y * 0.01) * 20;
        const adjustedDistance = distance + noise;
        
        // Create ring pattern
        const ringPattern = Math.sin(adjustedDistance * ringFrequency);
        
        // Add grain direction (vertical bias)
        const grainNoise = this.simpleNoise(x * 0.02, y * 0.001) * 0.3;
        
        const woodValue = ringPattern + grainNoise;
        const value = woodValue > 0 ? 255 : 0;
        
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
