export class DigitalRainPattern {
  /**
   * Generates realistic Matrix-style digital rain with proper brightness gradients and glowing effects
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with black background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;       // R
      data[i + 1] = 0;   // G
      data[i + 2] = 0;   // B
      data[i + 3] = 255; // A
    }
    
    // Create rain columns with varying properties
    const columnWidth = 4 + Math.floor(Math.random() * 8);
    const columnCount = Math.floor(width / columnWidth);
    
    for (let col = 0; col < columnCount; col++) {
      const columnX = col * columnWidth;
      const rainLength = 15 + Math.floor(Math.random() * height * 0.6);
      const rainStart = Math.floor(Math.random() * height);
      const speed = 0.5 + Math.random() * 1.5; // Animation speed variation
      
      for (let i = 0; i < rainLength; i++) {
        const y = (rainStart + Math.floor(i * speed)) % height;
        
        // Calculate position in the rain trail (0 = head, 1 = tail)
        const trailPosition = i / (rainLength - 1);
        
        // Brightness increases towards the bottom (head of the rain)
        const baseBrightness = Math.pow(1 - trailPosition, 2.5); // Exponential falloff
        
        // Create character blocks with more realistic spacing
        for (let dy = 0; dy < Math.min(columnWidth - 1, 3); dy++) {
          for (let dx = 0; dx < Math.min(columnWidth - 1, 3); dx++) {
            const x = columnX + dx;
            const charY = y + dy;
            
            if (x < width && charY < height) {
              const index = (charY * width + x) * 4;
              
              // Random character pattern with higher density at the head
              const characterDensity = trailPosition < 0.3 ? 0.9 : 0.6;
              
              if (Math.random() < characterDensity) {
                // Calculate brightness with subtle randomization
                const randomFactor = 0.8 + Math.random() * 0.4;
                let brightness = Math.floor(baseBrightness * 255 * randomFactor);
                
                // Ensure minimum visibility for trailing characters
                if (trailPosition > 0.7) {
                  brightness = Math.max(brightness, 20);
                }
                
                // Matrix-style green with subtle variations
                data[index] = Math.floor(brightness * 0.1);      // R - minimal red
                data[index + 1] = brightness;                    // G - primary green
                data[index + 2] = Math.floor(brightness * 0.2);  // B - slight blue tint
              }
            }
          }
        }
      }
    }
    
    // Add bright leading characters with glow effect
    for (let col = 0; col < columnCount; col++) {
      if (Math.random() < 0.7) {
        const columnX = col * columnWidth;
        const leadY = Math.floor(Math.random() * height);
        
        // Main bright character
        for (let dy = 0; dy < Math.min(columnWidth - 1, 3); dy++) {
          for (let dx = 0; dx < Math.min(columnWidth - 1, 3); dx++) {
            const x = columnX + dx;
            const y = leadY + dy;
            
            if (x < width && y < height) {
              const index = (y * width + x) * 4;
              
              // Bright white/light green leading character
              data[index] = 220;     // R - bright white core
              data[index + 1] = 255; // G - maximum green
              data[index + 2] = 220; // B - bright white core
            }
          }
        }
        
        // Add glow effect around leading character
        const glowRadius = 2;
        for (let gy = -glowRadius; gy <= glowRadius; gy++) {
          for (let gx = -glowRadius; gx <= glowRadius; gx++) {
            const glowX = columnX + 1 + gx;
            const glowY = leadY + 1 + gy;
            
            if (glowX >= 0 && glowX < width && glowY >= 0 && glowY < height) {
              const distance = Math.sqrt(gx * gx + gy * gy);
              if (distance > 0 && distance <= glowRadius) {
                const index = (glowY * width + glowX) * 4;
                const glowIntensity = Math.max(0, 1 - distance / glowRadius);
                const glowBrightness = Math.floor(glowIntensity * 120);
                
                // Add glow without overwriting existing bright pixels
                if (data[index + 1] < glowBrightness) {
                  data[index] = Math.floor(glowBrightness * 0.3);     // R
                  data[index + 1] = glowBrightness;                   // G
                  data[index + 2] = Math.floor(glowBrightness * 0.4); // B
                }
              }
            }
          }
        }
      }
    }
    
    // Add subtle digital noise and flickering effects
    const noiseCount = Math.floor(width * height * 0.001);
    
    for (let i = 0; i < noiseCount; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const index = (y * width + x) * 4;
      
      if (Math.random() < 0.3) {
        const noiseBrightness = 30 + Math.floor(Math.random() * 50);
        data[index] = Math.floor(noiseBrightness * 0.2);     // R
        data[index + 1] = noiseBrightness;                   // G
        data[index + 2] = Math.floor(noiseBrightness * 0.3); // B
      }
    }
    
    // Add enhanced Matrix-style visual effects
    this.addMatrixGlow(data, width, height, columnCount, columnWidth);
    this.addTrailingEffects(data, width, height);
  }
  
  /**
   * Adds glow effects and enhanced brightness to simulate Matrix-style lighting
   */
  private static addMatrixGlow(data: Uint8ClampedArray, width: number, height: number, columnCount: number, columnWidth: number): void {
    // Add column-based glow effects
    for (let col = 0; col < columnCount; col++) {
      const columnX = col * columnWidth;
      
      // Random vertical glow streaks
      if (Math.random() < 0.3) {
        const glowHeight = 20 + Math.floor(Math.random() * 40);
        const glowStart = Math.floor(Math.random() * (height - glowHeight));
        
        for (let i = 0; i < glowHeight; i++) {
          const y = glowStart + i;
          const intensity = Math.sin((i / glowHeight) * Math.PI); // Sine wave for smooth glow
          
          for (let dx = 0; dx < columnWidth; dx++) {
            const x = columnX + dx;
            if (x < width && y < height) {
              const index = (y * width + x) * 4;
              const glowBrightness = Math.floor(intensity * 60);
              
              // Add glow without overwriting brighter pixels
              if (data[index + 1] < glowBrightness + 50) {
                data[index] = Math.max(data[index], Math.floor(glowBrightness * 0.2));
                data[index + 1] = Math.max(data[index + 1], glowBrightness);
                data[index + 2] = Math.max(data[index + 2], Math.floor(glowBrightness * 0.3));
              }
            }
          }
        }
      }
    }
  }
  
  /**
   * Adds trailing effects and brightness enhancement for more realistic rain
   */
  private static addTrailingEffects(data: Uint8ClampedArray, width: number, height: number): void {
    // Create temporary copy to avoid feedback loops
    const originalData = new Uint8ClampedArray(data);
    
    // Apply subtle vertical blur for trailing effect
    for (let y = 1; y < height - 1; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const aboveIndex = ((y - 1) * width + x) * 4;
        
        // Only apply trailing to green pixels (Matrix characters)
        if (originalData[index + 1] > 30) {
          // Enhance the trailing effect by blending with pixels above
          const trailIntensity = 0.15;
          data[aboveIndex + 1] = Math.max(data[aboveIndex + 1], 
            Math.floor(originalData[index + 1] * trailIntensity));
          data[aboveIndex] = Math.max(data[aboveIndex], 
            Math.floor(originalData[index] * trailIntensity));
          data[aboveIndex + 2] = Math.max(data[aboveIndex + 2], 
            Math.floor(originalData[index + 2] * trailIntensity));
        }
      }
    }
  }
}
