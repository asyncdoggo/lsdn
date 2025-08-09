export class DatamoshPattern {
  /**
   * Generates datamosh glitch effects with horizontal displacement
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with base pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const baseValue = 100 + Math.sin(x * 0.1) * Math.cos(y * 0.08) * 50;
        data[index] = baseValue;     // R
        data[index + 1] = baseValue; // G
        data[index + 2] = baseValue; // B
        data[index + 3] = 255;       // A
      }
    }
    
    // Apply datamosh glitches
    const glitchCount = 20 + Math.random() * 30;
    
    for (let glitch = 0; glitch < glitchCount; glitch++) {
      const glitchX = Math.floor(Math.random() * width);
      const glitchY = Math.floor(Math.random() * height);
      const glitchWidth = 10 + Math.random() * 100;
      const glitchHeight = 5 + Math.random() * 20;
      
      // Create horizontal displacement
      const displacement = (Math.random() - 0.5) * 50;
      
      for (let y = glitchY; y < Math.min(height, glitchY + glitchHeight); y++) {
        for (let x = glitchX; x < Math.min(width, glitchX + glitchWidth); x++) {
          const sourceX = Math.floor(x + displacement);
          if (sourceX >= 0 && sourceX < width) {
            const sourceIndex = (y * width + sourceX) * 4;
            const targetIndex = (y * width + x) * 4;
            
            // Copy with corruption
            data[targetIndex] = Math.min(255, data[sourceIndex] + (Math.random() - 0.5) * 100);
            data[targetIndex + 1] = data[sourceIndex + 1];
            data[targetIndex + 2] = data[sourceIndex + 2];
          }
        }
      }
    }
  }
}
