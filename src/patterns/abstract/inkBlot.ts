export class InkBlotPattern {
  /**
   * Generates ink blot patterns with organic, sharp-edged shapes
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // A
    }
    
    // Create multiple ink blot centers with randomization
    const centers = [];
    const numCenters = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numCenters; i++) {
      centers.push({
        x: Math.random() * width,
        y: Math.random() * height,
        intensity: 0.6 + Math.random() * 0.4,
        size: 80 + Math.random() * 150,
        randomSeed: Math.random() * 1000
      });
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        let value = 255;
        
        // Calculate distance to nearest ink center
        for (const center of centers) {
          const dx = x - center.x;
          const dy = y - center.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Create sharp, organic shapes with randomization
          const noise = Math.sin((x + center.randomSeed) * 0.02) * Math.cos((y + center.randomSeed) * 0.015) * 40;
          const organicDistance = distance + noise;
          
          if (organicDistance < center.size) {
            const falloff = 1 - (organicDistance / center.size);
            // Make edges much sharper
            const sharpFalloff = falloff > 0.3 ? 1 : 0;
            const inkIntensity = sharpFalloff * center.intensity;
            if (inkIntensity > 0.5) {
              value = 0; // Pure black
            }
          }
        }
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
