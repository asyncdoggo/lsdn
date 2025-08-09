export class AbstractArtPattern {
  /**
   * Generates abstract mathematical art patterns
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Add randomization for unique patterns
    const freqX1 = 0.01 + Math.random() * 0.02;
    const freqY1 = 0.015 + Math.random() * 0.02;
    const freqR = 0.005 + Math.random() * 0.015;
    const freqXY = 0.01 + Math.random() * 0.015;
    const offset = Math.random() * Math.PI * 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Complex mathematical patterns with randomization
        const t1 = Math.sin(x * freqX1 + offset) * Math.cos(y * freqY1 + offset);
        const t2 = Math.sin(Math.sqrt(x * x + y * y) * freqR + offset);
        const t3 = Math.cos((x + y) * freqXY + offset) * Math.sin((x - y) * freqXY + offset);
        
        const pattern = (t1 + t2 + t3) / 3;
        
        // Sharp threshold for crisp patterns
        const value = pattern > 0.1 ? 255 : 0;
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
