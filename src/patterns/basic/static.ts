import type { Resolution } from '../../imageGenerator';

export class StaticPattern {
  /**
   * Generates TV static/interference patterns
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const density = 0.3 + Math.random() * 0.4; // How much static
    const clusterSize = 1 + Math.floor(Math.random() * 3); // Size of static clusters
    
    for (let y = 0; y < resolution.height; y += clusterSize) {
      for (let x = 0; x < resolution.width; x += clusterSize) {
        const value = Math.random() < density ? 0 : 255;
        
        // Fill cluster
        for (let cy = 0; cy < clusterSize && y + cy < resolution.height; cy++) {
          for (let cx = 0; cx < clusterSize && x + cx < resolution.width; cx++) {
            const index = ((y + cy) * resolution.width + (x + cx)) * 4;
            
            // Add some randomness within clusters
            const clusterValue = Math.random() > 0.2 ? value : (value === 0 ? 255 : 0);
            
            data[index] = clusterValue;
            data[index + 1] = clusterValue;
            data[index + 2] = clusterValue;
            data[index + 3] = 255;
          }
        }
      }
    }
    
    // Add scan lines for authentic TV static look
    const numScanLines = Math.floor(resolution.height / (5 + Math.random() * 10));
    for (let i = 0; i < numScanLines; i++) {
      const y = Math.floor(Math.random() * resolution.height);
      const intensity = Math.random() > 0.5 ? 0 : 255;
      
      for (let x = 0; x < resolution.width; x++) {
        if (Math.random() > 0.3) { // Don't fill entire line
          const index = (y * resolution.width + x) * 4;
          data[index] = intensity;
          data[index + 1] = intensity;
          data[index + 2] = intensity;
        }
      }
    }
  }
}
