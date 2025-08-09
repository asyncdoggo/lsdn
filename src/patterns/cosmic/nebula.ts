export class NebulaPattern {
  /**
   * Generates nebula cloud patterns with sharp, defined edges
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with space background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 10;     // R
      data[i + 1] = 10; // G
      data[i + 2] = 10; // B
      data[i + 3] = 255; // A
    }
    
    // Create multiple nebula clouds with randomization
    const nebulaCenters = [];
    const numCenters = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numCenters; i++) {
      nebulaCenters.push({
        x: Math.random() * width,
        y: Math.random() * height,
        size: 120 + Math.random() * 180,
        density: 0.5 + Math.random() * 0.5,
        randomSeed: Math.random() * 1000
      });
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        let intensity = 0;
        
        // Calculate nebula effects
        for (const nebula of nebulaCenters) {
          const dx = x - nebula.x;
          const dy = y - nebula.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Create sharp, defined cloud patterns
          const noise1 = Math.sin((x + nebula.randomSeed) * 0.015) * Math.cos((y + nebula.randomSeed) * 0.012);
          const noise2 = Math.sin((x + nebula.randomSeed) * 0.006 + (y + nebula.randomSeed) * 0.008) * 0.5;
          const noise3 = Math.cos((x + nebula.randomSeed) * 0.009 - (y + nebula.randomSeed) * 0.014) * 0.3;
          
          const distortion = (noise1 + noise2 + noise3) * 25;
          const effectiveDistance = distance + distortion;
          
          if (effectiveDistance < nebula.size) {
            const falloff = 1 - (effectiveDistance / nebula.size);
            // Much sharper edges for defined nebula structure
            const sharpFalloff = falloff > 0.3 ? Math.pow(falloff, 0.5) : 0;
            intensity += sharpFalloff * nebula.density;
          }
        }
        
        // Add some scattered bright stars
        const starChance = Math.random();
        if (starChance < 0.0008) {
          intensity = 1;
        }
        
        intensity = Math.min(1, intensity);
        const value = Math.floor(255 * intensity);
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
