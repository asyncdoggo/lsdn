export class KaleidoscopePattern {
  /**
   * Generates kaleidoscope patterns with rotational symmetry
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Randomize kaleidoscope parameters
    const segments = 6 + Math.floor(Math.random() * 6); // 6-11 segments
    const freqX = 0.01 + Math.random() * 0.02;
    const freqY = 0.015 + Math.random() * 0.02;
    const freqR = 0.005 + Math.random() * 0.015;
    const offset = Math.random() * Math.PI * 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const angle = Math.atan2(dy, dx);
        const distance = Math.sqrt(dx * dx + dy * dy);
        
        // Create kaleidoscope effect with randomization
        const segmentAngle = (Math.PI * 2) / segments;
        const normalizedAngle = ((angle % segmentAngle) + segmentAngle) % segmentAngle;
        const mirroredAngle = normalizedAngle > segmentAngle / 2 ? 
                             segmentAngle - normalizedAngle : normalizedAngle;
        
        const patternX = Math.cos(mirroredAngle) * distance;
        const patternY = Math.sin(mirroredAngle) * distance;
        
        const pattern = Math.sin(patternX * freqX + offset) * Math.cos(patternY * freqY + offset) *
                       Math.sin(distance * freqR + offset);
        
        // Sharp threshold for crisp kaleidoscope
        const value = pattern > 0.2 ? 255 : 0;
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
