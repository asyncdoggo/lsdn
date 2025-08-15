/**
 * Noise generation utilities for diffusion models
 */

export interface NoiseGeneratorOptions {
  seed?: number;
  distribution?: 'normal' | 'uniform';
}

export class NoiseGenerator {
  private seed?: number;
  private seededRandom?: () => number;

  constructor(options: NoiseGeneratorOptions = {}) {
    if (options.seed !== undefined) {
      this.setSeed(options.seed);
    }
  }

  /**
   * Set a seed for reproducible noise generation
   */
  setSeed(seed: number): void {
    this.seed = seed;
    this.seededRandom = this.createSeededRandom(seed);
  }

  /**
   * Generate random latents with proper distribution
   */
  generateRandomLatents(shape: number[], noiseSigma: number = 1.0): Float16Array {
    // Use seeded random if available, otherwise use Math.random
    const random = this.seededRandom || Math.random;

    function randn() {
      // Box-Muller transform for normal distribution
      let u = random();
      let v = random();
      let z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return z;
    }

    let size = 1;
    shape.forEach(element => {
      size *= element;
    });

    let data = new Float16Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = randn() * noiseSigma;
    }
    return data;
  }

  /**
   * Generate uniform random values
   */
  generateUniformNoise(shape: number[], min: number = 0, max: number = 1): Float16Array {
    const random = this.seededRandom || Math.random;
    
    let size = 1;
    shape.forEach(element => {
      size *= element;
    });

    let data = new Float16Array(size);
    const range = max - min;
    
    for (let i = 0; i < size; i++) {
      data[i] = min + random() * range;
    }
    return data;
  }

  /**
   * Create a proper seedable random number generator using Linear Congruential Generator (LCG)
   * This provides better distribution than the sin-based approach
   */
  private createSeededRandom(seed: number): () => number {
    let currentSeed = seed;
    return function() {
      // LCG formula: (a * seed + c) % m
      // Using values from Numerical Recipes
      currentSeed = (currentSeed * 1664525 + 1013904223) % 0x100000000;
      return currentSeed / 0x100000000;
    };
  }

  /**
   * Reset to use Math.random (remove seed)
   */
  clearSeed(): void {
    this.seed = undefined;
    this.seededRandom = undefined;
  }

  /**
   * Get current seed
   */
  getCurrentSeed(): number | undefined {
    return this.seed;
  }
}
