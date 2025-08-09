import type { Resolution } from '../../imageGenerator';

export class VoronoiPattern {
  /**
   * Generates a Voronoi diagram pattern
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSeeds = Math.floor(Math.sqrt(resolution.width * resolution.height) / 50);
    const seeds: [number, number][] = [];
    
    // Generate random seed points
    for (let i = 0; i < numSeeds; i++) {
      seeds.push([
        Math.random() * resolution.width,
        Math.random() * resolution.height
      ]);
    }
    
    // Assign random colors to seeds (black or white)
    const seedColors = seeds.map(() => Math.random() > 0.5 ? 255 : 0);
    
    // Generate Voronoi diagram
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        // Find closest seed
        let minDistance = Infinity;
        let closestSeed = 0;
        
        for (let i = 0; i < seeds.length; i++) {
          const [seedX, seedY] = seeds[i];
          const distance = Math.sqrt((x - seedX) ** 2 + (y - seedY) ** 2);
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
}
