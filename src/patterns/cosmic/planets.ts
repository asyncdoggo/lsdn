export class PlanetsPattern {
  /**
   * Generates planet patterns with surface details and sphere shading
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with space
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 20;     // R
      data[i + 1] = 20; // G
      data[i + 2] = 20; // B
      data[i + 3] = 255; // A
    }
    
    // Generate planets
    const planetCount = 2 + Math.floor(Math.random() * 4);
    
    for (let p = 0; p < planetCount; p++) {
      const planetX = Math.random() * width;
      const planetY = Math.random() * height;
      const planetRadius = 30 + Math.random() * 80;
      const planetBrightness = 100 + Math.random() * 100;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const dx = x - planetX;
          const dy = y - planetY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < planetRadius) {
            const index = (y * width + x) * 4;
            
            // Create surface patterns
            const surfacePattern = Math.sin(x * 0.1) * Math.cos(y * 0.08) * 
                                 Math.sin(distance * 0.2);
            
            // Sphere shading
            const normalizedDistance = distance / planetRadius;
            const sphereShading = Math.sqrt(1 - normalizedDistance * normalizedDistance);
            
            const finalIntensity = (planetBrightness + surfacePattern * 30) * sphereShading;
            const value = Math.max(20, Math.min(255, finalIntensity));
            
            data[index] = value;     // R
            data[index + 1] = value; // G
            data[index + 2] = value; // B
          }
        }
      }
    }
  }
}
