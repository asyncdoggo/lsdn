export class ColumnsPattern {
  /**
   * Generates classical column patterns with capitals and bases
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with light background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 220;     // R
      data[i + 1] = 220; // G
      data[i + 2] = 220; // B
      data[i + 3] = 255; // A
    }
    
    // Create columns
    const columnCount = 3 + Math.floor(Math.random() * 4);
    const columnSpacing = width / (columnCount + 1);
    const columnWidth = Math.min(50, columnSpacing * 0.4);
    const columnHeight = height * 0.8;
    const columnTop = height * 0.1;
    
    for (let col = 0; col < columnCount; col++) {
      const columnX = (col + 1) * columnSpacing - columnWidth / 2;
      
      // Draw column shaft
      for (let y = columnTop; y < columnTop + columnHeight; y++) {
        for (let x = columnX; x < columnX + columnWidth; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            
            // Add fluting (vertical grooves)
            const flutingPattern = Math.sin((x - columnX) * Math.PI * 8 / columnWidth);
            const shading = 180 - flutingPattern * 30;
            
            data[index] = shading;     // R
            data[index + 1] = shading; // G
            data[index + 2] = shading; // B
          }
        }
      }
      
      // Draw capital (top)
      const capitalHeight = columnHeight * 0.1;
      const capitalWidth = columnWidth * 1.5;
      const capitalX = columnX - (capitalWidth - columnWidth) / 2;
      
      for (let y = columnTop - capitalHeight; y < columnTop; y++) {
        for (let x = capitalX; x < capitalX + capitalWidth; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            data[index] = 150;     // R
            data[index + 1] = 150; // G
            data[index + 2] = 150; // B
          }
        }
      }
      
      // Draw base
      const baseHeight = columnHeight * 0.08;
      const baseWidth = columnWidth * 1.3;
      const baseX = columnX - (baseWidth - columnWidth) / 2;
      
      for (let y = columnTop + columnHeight; y < columnTop + columnHeight + baseHeight; y++) {
        for (let x = baseX; x < baseX + baseWidth; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            data[index] = 160;     // R
            data[index + 1] = 160; // G
            data[index + 2] = 160; // B
          }
        }
      }
    }
  }
}
