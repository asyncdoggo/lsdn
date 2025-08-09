export class FlowFieldPattern {
  /**
   * Generates flow field patterns with flowing, curved lines
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
    
    // Random parameters for variation
    const freqX = 0.005 + Math.random() * 0.015;
    const freqY = 0.003 + Math.random() * 0.012;
    const offset = Math.random() * Math.PI * 2;
    
    // Create flow field based on noise
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Generate flow field angle with randomization
        const angle = Math.sin(x * freqX + offset) * Math.cos(y * freqY + offset) * Math.PI * 2;
        const flow = Math.sin(x * (freqX * 2) + y * (freqY * 1.5) + angle + offset) * 
                    Math.cos(x * (freqX * 1.8) - y * (freqY * 1.2) + angle * 0.5 + offset);
        
        // Create sharp flowing lines
        const lineStrength = Math.abs(Math.sin(x * 0.03 + flow * 15 + offset) * 
                                     Math.cos(y * 0.02 + flow * 12 + offset));
        
        // Sharp threshold for crisp lines
        const value = lineStrength > 0.7 ? 0 : 255;
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
