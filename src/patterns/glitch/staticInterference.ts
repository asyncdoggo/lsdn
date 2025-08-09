export class StaticInterferencePattern {
  /**
   * Generates static interference glitch effects with random noise
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with base TV static
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Random static noise
        const staticValue = Math.floor(Math.random() * 256);
        
        data[index] = staticValue;     // R
        data[index + 1] = staticValue; // G
        data[index + 2] = staticValue; // B
        data[index + 3] = 255;         // A
      }
    }
    
    // Add interference bands
    const bandCount = 3 + Math.floor(Math.random() * 8);
    
    for (let band = 0; band < bandCount; band++) {
      const bandY = Math.floor(Math.random() * height);
      const bandHeight = 3 + Math.floor(Math.random() * 15);
      const bandIntensity = 0.5 + Math.random() * 0.5;
      
      for (let y = bandY; y < Math.min(height, bandY + bandHeight); y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          
          // Create banding effect
          const wave = Math.sin(x * 0.1 + y * 0.05) * 0.5 + 0.5;
          const bandValue = Math.floor(wave * 255 * bandIntensity);
          
          data[index] = Math.min(255, data[index] + bandValue);
          data[index + 1] = Math.min(255, data[index + 1] + bandValue);
          data[index + 2] = Math.min(255, data[index + 2] + bandValue);
        }
      }
    }
    
    // Add color channel interference
    const channelGlitches = 2 + Math.floor(Math.random() * 5);
    
    for (let glitch = 0; glitch < channelGlitches; glitch++) {
      const glitchX = Math.floor(Math.random() * width);
      const glitchY = Math.floor(Math.random() * height);
      const glitchWidth = 20 + Math.floor(Math.random() * 100);
      const glitchHeight = 10 + Math.floor(Math.random() * 50);
      const channel = Math.floor(Math.random() * 3); // R, G, or B
      
      for (let y = glitchY; y < Math.min(height, glitchY + glitchHeight); y++) {
        for (let x = glitchX; x < Math.min(width, glitchX + glitchWidth); x++) {
          const index = (y * width + x) * 4;
          
          // Enhance specific color channel
          data[index + channel] = Math.min(255, data[index + channel] + Math.floor(Math.random() * 150));
        }
      }
    }
    
    // Add random pixel dropouts
    const dropoutCount = width * height * 0.05;
    
    for (let i = 0; i < dropoutCount; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const index = (y * width + x) * 4;
      
      if (Math.random() < 0.7) {
        // Black dropout
        data[index] = 0;
        data[index + 1] = 0;
        data[index + 2] = 0;
      } else {
        // White spike
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
      }
    }
    
    // Add rolling interference
    const rollCount = 1 + Math.floor(Math.random() * 3);
    
    for (let roll = 0; roll < rollCount; roll++) {
      const rollY = Math.floor(Math.random() * height);
      const rollIntensity = 0.3 + Math.random() * 0.4;
      
      for (let x = 0; x < width; x++) {
        const index = (rollY * width + x) * 4;
        
        // Create rolling bar effect
        const rollPattern = Math.sin(x * 0.2) * rollIntensity;
        const rollValue = Math.floor(rollPattern * 255);
        
        data[index] = Math.max(0, Math.min(255, data[index] + rollValue));
        data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + rollValue));
        data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + rollValue));
      }
    }
  }
}
