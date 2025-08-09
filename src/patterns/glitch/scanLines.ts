export class ScanLinesPattern {
  /**
   * Generates scan line glitch effects with horizontal lines
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with base pattern
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const baseValue = 120 + Math.sin(x * 0.05) * 30;
        data[index] = baseValue;     // R
        data[index + 1] = baseValue; // G
        data[index + 2] = baseValue; // B
        data[index + 3] = 255;       // A
      }
    }
    
    // Add scan lines with varying intensity
    const scanLineSpacing = 3 + Math.floor(Math.random() * 5);
    const scanLineIntensity = 0.3 + Math.random() * 0.4;
    
    for (let y = 0; y < height; y += scanLineSpacing) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Darken scan lines
        data[index] = Math.floor(data[index] * (1 - scanLineIntensity));
        data[index + 1] = Math.floor(data[index + 1] * (1 - scanLineIntensity));
        data[index + 2] = Math.floor(data[index + 2] * (1 - scanLineIntensity));
      }
    }
    
    // Add random glitched scan lines
    const glitchedLines = 5 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < glitchedLines; i++) {
      const y = Math.floor(Math.random() * height);
      const glitchIntensity = Math.random();
      
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        if (Math.random() < 0.3) {
          // Color channel corruption
          data[index] = Math.min(255, data[index] + (Math.random() - 0.5) * 200 * glitchIntensity);
          data[index + 1] = Math.min(255, data[index + 1] + (Math.random() - 0.5) * 100 * glitchIntensity);
          data[index + 2] = Math.min(255, data[index + 2] + (Math.random() - 0.5) * 150 * glitchIntensity);
        }
      }
    }
  }
}
