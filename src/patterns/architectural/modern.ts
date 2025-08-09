export class ModernPattern {
  /**
   * Generates modern architectural patterns with geometric buildings and windows
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with base color
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 200;     // R
      data[i + 1] = 200; // G
      data[i + 2] = 200; // B
      data[i + 3] = 255; // A
    }
    
    // Create modern geometric building elements
    const buildingCount = 5 + Math.floor(Math.random() * 8);
    
    for (let building = 0; building < buildingCount; building++) {
      const buildingX = (building / buildingCount) * width;
      const buildingWidth = width / buildingCount * (0.7 + Math.random() * 0.3);
      const buildingHeight = height * (0.3 + Math.random() * 0.6);
      const buildingTop = height - buildingHeight;
      
      // Draw building silhouette
      for (let y = buildingTop; y < height; y++) {
        for (let x = buildingX; x < buildingX + buildingWidth; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            
            const brightness = 60 + Math.random() * 40;
            data[index] = brightness;     // R
            data[index + 1] = brightness; // G
            data[index + 2] = brightness; // B
          }
        }
      }
      
      // Add windows grid
      const windowRows = Math.floor(buildingHeight / 20);
      const windowCols = Math.floor(buildingWidth / 15);
      
      for (let row = 0; row < windowRows; row++) {
        for (let col = 0; col < windowCols; col++) {
          const windowX = buildingX + (col + 1) * (buildingWidth / (windowCols + 1));
          const windowY = buildingTop + (row + 1) * (buildingHeight / (windowRows + 1));
          
          // Draw window
          for (let wy = 0; wy < 8; wy++) {
            for (let wx = 0; wx < 6; wx++) {
              const px = Math.floor(windowX + wx);
              const py = Math.floor(windowY + wy);
              
              if (px >= 0 && px < width && py >= 0 && py < height) {
                const index = (py * width + px) * 4;
                const windowBrightness = Math.random() > 0.3 ? 180 : 20;
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
