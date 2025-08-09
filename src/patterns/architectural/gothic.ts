export class GothicPattern {
  /**
   * Generates Gothic architectural patterns with pointed arches and columns
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with light background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 240;     // R
      data[i + 1] = 240; // G
      data[i + 2] = 240; // B
      data[i + 3] = 255; // A
    }
    
    // Create gothic arches and columns
    const archCount = 3 + Math.floor(Math.random() * 3);
    const archWidth = width / archCount;
    
    for (let arch = 0; arch < archCount; arch++) {
      const archCenterX = (arch + 0.5) * archWidth;
      const archHeight = height * 0.8;
      const archTop = height * 0.1;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          
          // Gothic arch shape
          const dx = x - archCenterX;
          
          // Pointed arch calculation
          const archRadius = archWidth * 0.3;
          const leftCenter = archCenterX - archRadius * 0.5;
          const rightCenter = archCenterX + archRadius * 0.5;
          
          const leftDist = Math.sqrt((x - leftCenter) ** 2 + (y - archTop - archHeight) ** 2);
          const rightDist = Math.sqrt((x - rightCenter) ** 2 + (y - archTop - archHeight) ** 2);
          
          // Create pointed arch
          if (y > archTop && y < archTop + archHeight) {
            if ((leftDist < archRadius && x < archCenterX) || 
                (rightDist < archRadius && x > archCenterX)) {
              if (Math.abs(dx) > archWidth * 0.25) {
                data[index] = 50;     // R
                data[index + 1] = 50; // G
                data[index + 2] = 50; // B
              }
            }
          }
          
          // Add columns
          if (Math.abs(dx) < 10 && y > archTop + archHeight * 0.8) {
            data[index] = 80;     // R
            data[index + 1] = 80; // G
            data[index + 2] = 80; // B
          }
          
          // Add decorative details
          const detailPattern = Math.sin(x * 0.1) * Math.cos(y * 0.05);
          if (Math.abs(detailPattern) > 0.9 && data[index] < 100) {
            data[index] = Math.max(data[index] - 30, 0);
            data[index + 1] = Math.max(data[index + 1] - 30, 0);
            data[index + 2] = Math.max(data[index + 2] - 30, 0);
          }
        }
      }
    }
  }
}
