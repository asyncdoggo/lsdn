export class CityscapePattern {
  /**
   * Generates cityscape patterns with varied building heights and windows
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with sky gradient
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        const skyGradient = 150 + (y / height) * 70;
        
        data[index] = skyGradient;     // R
        data[index + 1] = skyGradient + 20; // G
        data[index + 2] = skyGradient + 40; // B
        data[index + 3] = 255; // A
      }
    }
    
    // Generate cityscape buildings
    const buildingCount = 15 + Math.floor(Math.random() * 20);
    
    for (let building = 0; building < buildingCount; building++) {
      const buildingX = (building / buildingCount) * width;
      const buildingWidth = width / buildingCount * (0.8 + Math.random() * 0.4);
      const buildingHeight = height * (0.2 + Math.random() * 0.7);
      const buildingTop = height - buildingHeight;
      
      // Building color variation
      const buildingBrightness = 40 + Math.random() * 60;
      
      // Draw building silhouette
      for (let y = buildingTop; y < height; y++) {
        for (let x = buildingX; x < buildingX + buildingWidth; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            
            data[index] = buildingBrightness;     // R
            data[index + 1] = buildingBrightness; // G
            data[index + 2] = buildingBrightness; // B
          }
        }
      }
      
      // Add windows
      const windowRows = Math.floor(buildingHeight / 25);
      const windowCols = Math.floor(buildingWidth / 20);
      
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          if (Math.random() > 0.3) { // Not all windows are lit
            const windowX = buildingX + (col + 0.5) * (buildingWidth / windowCols);
            const windowY = buildingTop + (row + 0.5) * (buildingHeight / windowRows);
            
            // Draw window
            for (let wy = -3; wy <= 3; wy++) {
              for (let wx = -2; wx <= 2; wx++) {
                const px = Math.floor(windowX + wx);
                const py = Math.floor(windowY + wy);
                
                if (px >= 0 && px < width && py >= 0 && py < height) {
                  const index = (py * width + px) * 4;
                  const windowBrightness = Math.random() > 0.4 ? 200 + Math.random() * 55 : buildingBrightness;
                  data[index] = windowBrightness;     // R
                  data[index + 1] = windowBrightness; // G
                  data[index + 2] = windowBrightness; // B
                }
              }
            }
          }
        }
      }
    }
  }
}
