export class StarfieldPattern {
  /**
   * Generates starfield patterns with various star sizes
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with space (black)
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;     // R
      data[i + 1] = 0; // G
      data[i + 2] = 0; // B
      data[i + 3] = 255; // A
    }
    
    // Add different sizes of stars
    const starCount = Math.floor(width * height * 0.001);
    
    for (let i = 0; i < starCount; i++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const brightness = 150 + Math.random() * 105;
      const size = Math.random() < 0.95 ? 1 : (Math.random() < 0.8 ? 2 : 3);
      
      // Draw star with size
      for (let dy = -size; dy <= size; dy++) {
        for (let dx = -size; dx <= size; dx++) {
          const px = x + dx;
          const py = y + dy;
          
          if (px >= 0 && px < width && py >= 0 && py < height) {
            const distance = Math.sqrt(dx * dx + dy * dy);
            if (distance <= size) {
              const index = (py * width + px) * 4;
              const falloff = 1 - (distance / size);
              const starValue = brightness * falloff;
              
              data[index] = Math.max(data[index], starValue);     // R
              data[index + 1] = Math.max(data[index + 1], starValue); // G
              data[index + 2] = Math.max(data[index + 2], starValue); // B
            }
          }
        }
      }
    }
  }
}
