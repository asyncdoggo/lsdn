import type { Resolution } from '../../imageGenerator';

export class NoisePattern {
  /**
   * Generates simplified noise patterns that work reliably
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const noiseType = Math.floor(Math.random() * 4); // Reduced to 4 working types
    
    switch (noiseType) {
      case 0:
        this.generateWhiteNoise(data, resolution);
        break;
      case 1:
        this.generateSimpleValueNoise(data, resolution);
        break;
      case 2:
        this.generateSimplePerlinStyle(data, resolution);
        break;
      case 3:
        this.generateSimpleFBM(data, resolution);
        break;
    }
  }

  /**
   * Classic white noise - pure random (working)
   */
  private static generateWhiteNoise(data: Uint8ClampedArray, _resolution: Resolution): void {
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.floor(Math.random() * 256);
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }

  /**
   * Simple value noise with larger scale
   */
  private static generateSimpleValueNoise(data: Uint8ClampedArray, resolution: Resolution): void {
    const scale = 0.05; // Larger scale for visible patterns

    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const noiseValue = this.simpleNoise(x * scale, y * scale);
        const value = Math.floor(noiseValue * 255);
        
        const index = (y * resolution.width + x) * 4;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Simple Perlin-style noise
   */
  private static generateSimplePerlinStyle(data: Uint8ClampedArray, resolution: Resolution): void {
    const scale = 0.03;

    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const noiseValue = this.smoothNoise(x * scale, y * scale);
        const value = Math.floor((noiseValue + 1) * 127.5); // Convert from [-1,1] to [0,255]
        
        const index = (y * resolution.width + x) * 4;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Simple Fractal Brownian Motion
   */
  private static generateSimpleFBM(data: Uint8ClampedArray, resolution: Resolution): void {
    const baseScale = 0.02;
    const octaves = 3;

    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        let value = 0;
        let amplitude = 1;
        let frequency = baseScale;
        let maxValue = 0;

        for (let i = 0; i < octaves; i++) {
          value += this.simpleNoise(x * frequency, y * frequency) * amplitude;
          maxValue += amplitude;
          amplitude *= 0.5;
          frequency *= 2;
        }

        value /= maxValue;
        const pixelValue = Math.floor(value * 255);
        
        const index = (y * resolution.width + x) * 4;
        data[index] = pixelValue;
        data[index + 1] = pixelValue;
        data[index + 2] = pixelValue;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Very simple noise function that definitely works
   */
  private static simpleNoise(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    // Simple random values at grid points
    const a = this.simpleRandom(xi, yi);
    const b = this.simpleRandom(xi + 1, yi);
    const c = this.simpleRandom(xi, yi + 1);
    const d = this.simpleRandom(xi + 1, yi + 1);

    // Simple linear interpolation
    const i1 = a * (1 - xf) + b * xf;
    const i2 = c * (1 - xf) + d * xf;
    return i1 * (1 - yf) + i2 * yf;
  }

  /**
   * Smooth noise with better interpolation
   */
  private static smoothNoise(x: number, y: number): number {
    const xi = Math.floor(x);
    const yi = Math.floor(y);
    const xf = x - xi;
    const yf = y - yi;

    // Get corner values (normalized to -1 to 1)
    const a = this.simpleRandom(xi, yi) * 2 - 1;
    const b = this.simpleRandom(xi + 1, yi) * 2 - 1;
    const c = this.simpleRandom(xi, yi + 1) * 2 - 1;
    const d = this.simpleRandom(xi + 1, yi + 1) * 2 - 1;

    // Smooth interpolation
    const u = this.smoothstep(xf);
    const v = this.smoothstep(yf);

    // Bilinear interpolation
    const x1 = this.lerp(a, b, u);
    const x2 = this.lerp(c, d, u);
    return this.lerp(x1, x2, v);
  }

  /**
   * Simple deterministic random function
   */
  private static simpleRandom(x: number, y: number): number {
    let hash = ((x * 12.9898) + (y * 78.233)) * 43758.5453;
    return (Math.sin(hash) + 1) / 2; // Returns 0-1
  }

  /**
   * Smooth step function for better interpolation
   */
  private static smoothstep(t: number): number {
    return t * t * (3 - 2 * t);
  }

  /**
   * Linear interpolation
   */
  private static lerp(a: number, b: number, t: number): number {
    return a + (b - a) * t;
  }
}
