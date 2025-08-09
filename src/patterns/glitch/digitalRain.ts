export class DigitalRainPattern {
  /**
   * Generates digital rain glitch effects with falling characters/pixels
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with dark background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;       // R
      data[i + 1] = 20;  // G
      data[i + 2] = 0;   // B
      data[i + 3] = 255; // A
    }
    
    // Create rain columns
    const columnWidth = 8 + Math.floor(Math.random() * 12);
    const columnCount = Math.floor(width / columnWidth);
    
    for (let col = 0; col < columnCount; col++) {
      const columnX = col * columnWidth;
      const rainLength = 20 + Math.floor(Math.random() * height * 0.4);
      const rainStart = Math.floor(Math.random() * height);
      
      for (let i = 0; i < rainLength; i++) {
        const y = (rainStart + i) % height;
        
        // Create character blocks
        for (let dy = 0; dy < columnWidth - 2; dy++) {
          for (let dx = 0; dx < columnWidth - 2; dx++) {
            const x = columnX + dx + 1;
            const charY = y + dy;
            
            if (x < width && charY < height) {
              const index = (charY * width + x) * 4;
              
              // Intensity falls off from top of rain
              const intensity = Math.max(0, 1 - i / rainLength);
              
              // Random character pattern
              if (Math.random() < 0.7) {
                const brightness = Math.floor(intensity * 255);
                
                // Matrix-style green
                data[index] = Math.floor(brightness * 0.2);      // R
                data[index + 1] = brightness;                    // G
                data[index + 2] = Math.floor(brightness * 0.3);  // B
              }
            }
          }
        }
      }
    }
    
    // Add bright leading characters
    for (let col = 0; col < columnCount; col++) {
      if (Math.random() < 0.8) {
        const columnX = col * columnWidth;
        const leadY = Math.floor(Math.random() * height);
        
        for (let dy = 0; dy < columnWidth - 2; dy++) {
          for (let dx = 0; dx < columnWidth - 2; dx++) {
            const x = columnX + dx + 1;
            const y = leadY + dy;
            
            if (x < width && y < height) {
              const index = (y * width + x) * 4;
              
              // Bright white leading character
              data[index] = 255;     // R
              data[index + 1] = 255; // G
              data[index + 2] = 255; // B
            }
          }
        }
      }
    }
    
    // Add random digital artifacts
    const artifactCount = 10 + Math.floor(Math.random() * 20);
    
    for (let i = 0; i < artifactCount; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const size = 2 + Math.floor(Math.random() * 6);
      
      for (let dy = 0; dy < size; dy++) {
        for (let dx = 0; dx < size; dx++) {
          const artifactX = x + dx;
          const artifactY = y + dy;
          
          if (artifactX < width && artifactY < height) {
            const index = (artifactY * width + artifactX) * 4;
            
            if (Math.random() < 0.6) {
              data[index] = Math.floor(Math.random() * 100);     // R
              data[index + 1] = 100 + Math.floor(Math.random() * 155); // G
              data[index + 2] = Math.floor(Math.random() * 80);  // B
            }
          }
        }
      }
    }
  }
}
