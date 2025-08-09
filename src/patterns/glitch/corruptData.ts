export class CorruptDataPattern {
  /**
   * Generates corrupt data glitch effects with random noise and artifacts
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with base digital pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Create binary-like base pattern
        const binaryPattern = Math.floor((x + y * 0.7) / 20) % 2;
        const baseValue = binaryPattern * 100 + 50;
        
        data[index] = baseValue;     // R
        data[index + 1] = baseValue; // G
        data[index + 2] = baseValue; // B
        data[index + 3] = 255;       // A
      }
    }
    
    // Add corruption blocks
    const corruptionCount = 15 + Math.floor(Math.random() * 25);
    
    for (let i = 0; i < corruptionCount; i++) {
      const blockX = Math.floor(Math.random() * width);
      const blockY = Math.floor(Math.random() * height);
      const blockWidth = 5 + Math.floor(Math.random() * 30);
      const blockHeight = 5 + Math.floor(Math.random() * 20);
      
      for (let y = blockY; y < Math.min(height, blockY + blockHeight); y++) {
        for (let x = blockX; x < Math.min(width, blockX + blockWidth); x++) {
          const index = (y * width + x) * 4;
          
          // Random corruption
          if (Math.random() < 0.8) {
            data[index] = Math.floor(Math.random() * 256);
            data[index + 1] = Math.floor(Math.random() * 256);
            data[index + 2] = Math.floor(Math.random() * 256);
          }
        }
      }
    }
    
    // Add bit-level corruption (random pixel flips)
    const bitErrors = width * height * 0.02;
    
    for (let i = 0; i < bitErrors; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const index = (y * width + x) * 4;
      
      // Flip random color channel
      const channel = Math.floor(Math.random() * 3);
      data[index + channel] = 255 - data[index + channel];
    }
    
    // Add noise lines
    const noiseLines = 3 + Math.floor(Math.random() * 8);
    
    for (let i = 0; i < noiseLines; i++) {
      const y = Math.floor(Math.random() * height);
      const noiseIntensity = Math.random();
      
      for (let x = 0; x < width; x++) {
        if (Math.random() < 0.4) {
          const index = (y * width + x) * 4;
          const noise = (Math.random() - 0.5) * 255 * noiseIntensity;
          
          data[index] = Math.max(0, Math.min(255, data[index] + noise));
          data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + noise));
          data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + noise));
        }
      }
    }
  }
}
