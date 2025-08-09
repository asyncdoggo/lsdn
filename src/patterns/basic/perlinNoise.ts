import type { Resolution } from '../../imageGenerator';

export class PerlinNoisePattern {
  private static permutation: number[] = [];
  private static p: number[] = [];

  /**
   * Initialize Perlin noise permutation table
   */
  private static initPermutation(): void {
    if (this.permutation.length === 0) {
      // Generate random permutation
      for (let i = 0; i < 256; i++) {
        this.permutation[i] = i;
      }
      
      // Shuffle the permutation
      for (let i = 255; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [this.permutation[i], this.permutation[j]] = [this.permutation[j], this.permutation[i]];
      }
      
      // Duplicate the permutation
      for (let i = 0; i < 512; i++) {
        this.p[i] = this.permutation[i & 255];
      }
    }
  }

  /**
   * Fade function for smooth interpolation
   */
  private static fade(t: number): number {
    return t * t * t * (t * (t * 6 - 15) + 10);
  }

  /**
   * Linear interpolation
   */
  private static lerp(t: number, a: number, b: number): number {
    return a + t * (b - a);
  }

  /**
   * Gradient function
   */
  private static grad(hash: number, x: number, y: number): number {
    const h = hash & 15;
    const u = h < 8 ? x : y;
    const v = h < 4 ? y : h === 12 || h === 14 ? x : 0;
    return ((h & 1) === 0 ? u : -u) + ((h & 2) === 0 ? v : -v);
  }

  /**
   * 2D Perlin noise function
   */
  private static noise(x: number, y: number): number {
    const X = Math.floor(x) & 255;
    const Y = Math.floor(y) & 255;
    
    x -= Math.floor(x);
    y -= Math.floor(y);
    
    const u = this.fade(x);
    const v = this.fade(y);
    
    const A = this.p[X] + Y;
    const AA = this.p[A];
    const AB = this.p[A + 1];
    const B = this.p[X + 1] + Y;
    const BA = this.p[B];
    const BB = this.p[B + 1];
    
    return this.lerp(v,
      this.lerp(u,
        this.grad(this.p[AA], x, y),
        this.grad(this.p[BA], x - 1, y)
      ),
      this.lerp(u,
        this.grad(this.p[AB], x, y - 1),
        this.grad(this.p[BB], x - 1, y - 1)
      )
    );
  }

  /**
   * Generates simplified but reliable Perlin noise pattern
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    this.initPermutation();
    
    // Simplified parameters for reliable generation
    const scale = 0.01 + Math.random() * 0.01; // Increased scale
    const threshold = -0.1 + Math.random() * 0.2;
    
    // Simpler pattern types
    const patternType = Math.floor(Math.random() * 2);
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let noiseValue: number;
        
        if (patternType === 0) {
          // Simple single octave noise
          noiseValue = this.noise(x * scale, y * scale);
        } else {
          // Simple 2-octave combination
          noiseValue = this.noise(x * scale, y * scale) * 0.6 + 
                      this.noise(x * scale * 2, y * scale * 2) * 0.4;
        }
        
        // Convert to binary with threshold
        const value = noiseValue > threshold ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }
}
