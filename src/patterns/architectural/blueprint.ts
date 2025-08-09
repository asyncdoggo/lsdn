export class BlueprintPattern {
  /**
   * Generates blueprint-style architectural patterns with grid and floor plans
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with blueprint blue background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 20;      // R
      data[i + 1] = 50;  // G
      data[i + 2] = 100; // B
      data[i + 3] = 255; // A
    }
    
    // Draw blueprint lines (white)
    const lineColor = 220;
    
    // Draw grid
    const gridSpacing = 50;
    for (let x = 0; x < width; x += gridSpacing) {
      for (let y = 0; y < height; y++) {
        const index = (y * width + x) * 4;
        data[index] = lineColor;     // R
        data[index + 1] = lineColor; // G
        data[index + 2] = lineColor; // B
      }
    }
    
    for (let y = 0; y < height; y += gridSpacing) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        data[index] = lineColor;     // R
        data[index + 1] = lineColor; // G
        data[index + 2] = lineColor; // B
      }
    }
    
    // Draw floor plan rectangles
    const centerX = width / 2;
    const centerY = height / 2;
    
    const rooms = [
      { x: centerX - 150, y: centerY - 100, w: 100, h: 80 },
      { x: centerX - 50, y: centerY - 100, w: 120, h: 80 },
      { x: centerX + 70, y: centerY - 100, w: 80, h: 80 },
      { x: centerX - 100, y: centerY - 20, w: 200, h: 60 }
    ];
    
    for (const room of rooms) {
      // Draw room outline
      for (let i = 0; i < room.w; i++) {
        // Top and bottom lines
        if (room.x + i >= 0 && room.x + i < width) {
          if (room.y >= 0 && room.y < height) {
            const topIndex = (room.y * width + (room.x + i)) * 4;
            data[topIndex] = lineColor;
            data[topIndex + 1] = lineColor;
            data[topIndex + 2] = lineColor;
          }
          if (room.y + room.h >= 0 && room.y + room.h < height) {
            const bottomIndex = ((room.y + room.h) * width + (room.x + i)) * 4;
            data[bottomIndex] = lineColor;
            data[bottomIndex + 1] = lineColor;
            data[bottomIndex + 2] = lineColor;
          }
        }
      }
      
      for (let i = 0; i < room.h; i++) {
        // Left and right lines
        if (room.y + i >= 0 && room.y + i < height) {
          if (room.x >= 0 && room.x < width) {
            const leftIndex = ((room.y + i) * width + room.x) * 4;
            data[leftIndex] = lineColor;
            data[leftIndex + 1] = lineColor;
            data[leftIndex + 2] = lineColor;
          }
          if (room.x + room.w >= 0 && room.x + room.w < width) {
            const rightIndex = ((room.y + i) * width + (room.x + room.w)) * 4;
            data[rightIndex] = lineColor;
            data[rightIndex + 1] = lineColor;
            data[rightIndex + 2] = lineColor;
          }
        }
      }
    }
  }
}
