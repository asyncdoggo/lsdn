import type { Resolution } from '../../imageGenerator';

export class VoronoiPattern {
  /**
   * Generates sophisticated Voronoi diagram patterns with multiple variations
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const patternType = Math.floor(Math.random() * 6);
    
    switch (patternType) {
      case 0:
        this.generateClassicVoronoi(data, resolution);
        break;
      case 1:
        this.generateVoronoiEdges(data, resolution);
        break;
      case 2:
        this.generateDistanceField(data, resolution);
        break;
      case 3:
        this.generateWorleyNoise(data, resolution);
        break;
      case 4:
        this.generateRelaxedVoronoi(data, resolution);
        break;
      case 5:
        this.generateCrystalVoronoi(data, resolution);
        break;
    }
  }

  /**
   * Classic Voronoi diagram with optimized seed distribution
   */
  private static generateClassicVoronoi(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSeeds = 20 + Math.floor(Math.sqrt(resolution.width * resolution.height) / 80);
    const seeds = this.generatePoissonSeeds(numSeeds, resolution);
    const seedColors = seeds.map(() => Math.random() > 0.5 ? 255 : 0);
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        const closestSeed = this.findClosestSeed(x, y, seeds);
        const value = seedColors[closestSeed];
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Voronoi edges only - highlighting cell boundaries
   */
  private static generateVoronoiEdges(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSeeds = 15 + Math.floor(Math.sqrt(resolution.width * resolution.height) / 100);
    const seeds = this.generatePoissonSeeds(numSeeds, resolution);
    const edgeThickness = 1 + Math.floor(Math.random() * 3);
    
    // Fill with white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Find two closest seeds
        const distances = seeds.map(([sx, sy]) => 
          Math.sqrt((x - sx) ** 2 + (y - sy) ** 2)
        ).sort((a, b) => a - b);
        
        // If the difference between closest and second closest is small, it's an edge
        if (distances[1] - distances[0] < edgeThickness) {
          data[index] = 0;
          data[index + 1] = 0;
          data[index + 2] = 0;
        }
      }
    }
  }

  /**
   * Distance field visualization
   */
  private static generateDistanceField(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSeeds = 8 + Math.floor(Math.random() * 12);
    const seeds = this.generatePoissonSeeds(numSeeds, resolution);
    const threshold = 20 + Math.random() * 50;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Find distance to closest seed
        let minDistance = Infinity;
        for (const [sx, sy] of seeds) {
          const distance = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2);
          minDistance = Math.min(minDistance, distance);
        }
        
        // Create pattern based on distance bands
        const band = Math.floor(minDistance / threshold) % 2;
        const value = band === 0 ? 255 : 0;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Worley noise (cellular texture)
   */
  private static generateWorleyNoise(data: Uint8ClampedArray, resolution: Resolution): void {
    const cellSize = 30 + Math.random() * 50;
    const noiseType = Math.floor(Math.random() * 4);
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Get cell coordinates
        const cellX = Math.floor(x / cellSize);
        const cellY = Math.floor(y / cellSize);
        
        let minDistance = Infinity;
        let secondDistance = Infinity;
        
        // Check surrounding cells
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const seedX = (cellX + dx) * cellSize + this.hash2D(cellX + dx, cellY + dy) % cellSize;
            const seedY = (cellY + dy) * cellSize + this.hash2D(cellX + dx + 1, cellY + dy) % cellSize;
            
            const distance = Math.sqrt((x - seedX) ** 2 + (y - seedY) ** 2);
            
            if (distance < minDistance) {
              secondDistance = minDistance;
              minDistance = distance;
            } else if (distance < secondDistance) {
              secondDistance = distance;
            }
          }
        }
        
        let value = 0;
        switch (noiseType) {
          case 0: // F1
            value = minDistance < cellSize * 0.3 ? 255 : 0;
            break;
          case 1: // F2 - F1
            value = (secondDistance - minDistance) > cellSize * 0.1 ? 255 : 0;
            break;
          case 2: // F1 + F2
            value = (minDistance + secondDistance) < cellSize * 0.8 ? 255 : 0;
            break;
          case 3: // Crackle
            value = minDistance < 5 ? 255 : 0;
            break;
        }
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Lloyd's relaxation for more uniform cells
   */
  private static generateRelaxedVoronoi(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSeeds = 15 + Math.floor(Math.sqrt(resolution.width * resolution.height) / 120);
    let seeds = this.generateRandomSeeds(numSeeds, resolution);
    
    // Apply Lloyd's relaxation
    for (let iteration = 0; iteration < 3; iteration++) {
      const newSeeds: [number, number][] = [];
      
      for (let i = 0; i < seeds.length; i++) {
        let sumX = 0, sumY = 0, count = 0;
        
        // Sample points in the Voronoi cell
        for (let y = 0; y < resolution.height; y += 5) {
          for (let x = 0; x < resolution.width; x += 5) {
            if (this.findClosestSeed(x, y, seeds) === i) {
              sumX += x;
              sumY += y;
              count++;
            }
          }
        }
        
        if (count > 0) {
          newSeeds.push([sumX / count, sumY / count]);
        } else {
          newSeeds.push(seeds[i]);
        }
      }
      
      seeds = newSeeds;
    }
    
    // Generate pattern with relaxed seeds
    const seedColors = seeds.map(() => Math.random() > 0.5 ? 255 : 0);
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        const closestSeed = this.findClosestSeed(x, y, seeds);
        const value = seedColors[closestSeed];
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Crystal-like Voronoi with Manhattan distance
   */
  private static generateCrystalVoronoi(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSeeds = 10 + Math.floor(Math.sqrt(resolution.width * resolution.height) / 150);
    const seeds = this.generatePoissonSeeds(numSeeds, resolution);
    const seedColors = seeds.map(() => Math.random() > 0.5 ? 255 : 0);
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Find closest seed using Manhattan distance
        let minDistance = Infinity;
        let closestSeed = 0;
        
        for (let i = 0; i < seeds.length; i++) {
          const [sx, sy] = seeds[i];
          const distance = Math.abs(x - sx) + Math.abs(y - sy); // Manhattan distance
          if (distance < minDistance) {
            minDistance = distance;
            closestSeed = i;
          }
        }
        
        const value = seedColors[closestSeed];
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Generates seeds using Poisson disk sampling for better distribution
   */
  private static generatePoissonSeeds(numSeeds: number, resolution: Resolution): [number, number][] {
    const seeds: [number, number][] = [];
    const minDistance = Math.sqrt(resolution.width * resolution.height / numSeeds) * 0.8;
    const maxAttempts = 30;
    
    // First seed
    seeds.push([Math.random() * resolution.width, Math.random() * resolution.height]);
    
    while (seeds.length < numSeeds) {
      let placed = false;
      
      for (let attempt = 0; attempt < maxAttempts && !placed; attempt++) {
        const x = Math.random() * resolution.width;
        const y = Math.random() * resolution.height;
        
        let valid = true;
        for (const [sx, sy] of seeds) {
          if (Math.sqrt((x - sx) ** 2 + (y - sy) ** 2) < minDistance) {
            valid = false;
            break;
          }
        }
        
        if (valid) {
          seeds.push([x, y]);
          placed = true;
        }
      }
      
      if (!placed) break; // Can't place more seeds
    }
    
    return seeds;
  }

  /**
   * Generates random seeds
   */
  private static generateRandomSeeds(numSeeds: number, resolution: Resolution): [number, number][] {
    const seeds: [number, number][] = [];
    for (let i = 0; i < numSeeds; i++) {
      seeds.push([Math.random() * resolution.width, Math.random() * resolution.height]);
    }
    return seeds;
  }

  /**
   * Finds the index of the closest seed to a point
   */
  private static findClosestSeed(x: number, y: number, seeds: [number, number][]): number {
    let minDistance = Infinity;
    let closestSeed = 0;
    
    for (let i = 0; i < seeds.length; i++) {
      const [sx, sy] = seeds[i];
      const distance = Math.sqrt((x - sx) ** 2 + (y - sy) ** 2);
      if (distance < minDistance) {
        minDistance = distance;
        closestSeed = i;
      }
    }
    
    return closestSeed;
  }

  /**
   * Simple 2D hash function
   */
  private static hash2D(x: number, y: number): number {
    return Math.abs(((x * 73856093) ^ (y * 19349663)) % 1000000);
  }
}
