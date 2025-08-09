export class MorphingPattern {
  /**
   * Generates morphing patterns with time-based transformations
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Add randomization for unique morphing patterns
    const freqX1 = 0.005 + Math.random() * 0.015;
    const freqY1 = 0.004 + Math.random() * 0.012;
    const freqX2 = 0.015 + Math.random() * 0.02;
    const freqY2 = 0.02 + Math.random() * 0.025;
    const timeFreq = 0.5 + Math.random() * 1.5;
    const offset = Math.random() * Math.PI * 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Create morphing effect with randomized time-like parameter
        const time = Math.sin(x * freqX1 + offset) + Math.cos(y * freqY1 + offset);
        const morph1 = Math.sin(x * freqX2 + time * timeFreq + offset) * Math.cos(y * freqY1 + time * timeFreq + offset);
        const morph2 = Math.cos(x * freqX1 - time * timeFreq + offset) * Math.sin(y * freqY2 - time * timeFreq + offset);
        
        const blend = Math.sin(time * 2 + offset) * 0.5 + 0.5;
        const pattern = morph1 * blend + morph2 * (1 - blend);
        
        // Sharp threshold for crisp morphing
        const value = pattern > 0.15 ? 255 : 0;
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
