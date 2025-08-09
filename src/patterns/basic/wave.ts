import type { Resolution } from '../../imageGenerator';

export class WavePattern {
  /**
   * Generates wave interference patterns
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const numWaves = 3 + Math.floor(Math.random() * 5);
    const waves: { x: number; y: number; frequency: number; amplitude: number }[] = [];
    
    // Generate random wave sources
    for (let i = 0; i < numWaves; i++) {
      waves.push({
        x: Math.random() * resolution.width,
        y: Math.random() * resolution.height,
        frequency: 0.01 + Math.random() * 0.05,
        amplitude: 0.5 + Math.random() * 0.5
      });
    }
    
    // Generate wave interference pattern
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let sum = 0;
        for (const wave of waves) {
          const distance = Math.sqrt((x - wave.x) ** 2 + (y - wave.y) ** 2);
          sum += Math.sin(distance * wave.frequency) * wave.amplitude;
        }
        
        const value = sum > 0 ? 255 : 0;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }
}
