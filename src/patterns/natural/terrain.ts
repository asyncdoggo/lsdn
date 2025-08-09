import type { Resolution } from '../../imageGenerator';

export class TerrainPattern {
  /**
   * Generates terrain/mountain silhouettes
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white (sky)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const numLayers = 3 + Math.floor(Math.random() * 3);
    
    for (let layer = 0; layer < numLayers; layer++) {
      const heights: number[] = [];
      const baseHeight = resolution.height * (0.3 + layer * 0.2 + Math.random() * 0.3);
      
      // Generate mountain profile
      for (let x = 0; x < resolution.width; x++) {
        let height = baseHeight;
        
        // Add multiple frequencies for realistic mountains
        height += Math.sin(x * 0.001) * 50 * (1 + layer);
        height += Math.sin(x * 0.003) * 30 * (1 + layer);
        height += Math.sin(x * 0.01) * 15 * (1 + layer);
        height += Math.sin(x * 0.02) * 8 * (1 + layer);
        
        // Add some randomness
        height += (Math.random() - 0.5) * 20;
        
        heights.push(Math.max(0, Math.min(resolution.height, height)));
      }
      
      // Smooth the heights
      for (let pass = 0; pass < 2; pass++) {
        for (let x = 1; x < heights.length - 1; x++) {
          heights[x] = (heights[x - 1] + heights[x] + heights[x + 1]) / 3;
        }
      }
      
      // Fill the terrain
      for (let x = 0; x < resolution.width; x++) {
        const terrainHeight = heights[x];
        for (let y = Math.floor(terrainHeight); y < resolution.height; y++) {
          const index = (y * resolution.width + x) * 4;
          data[index] = 0;
          data[index + 1] = 0;
          data[index + 2] = 0;
        }
      }
    }
  }
}
