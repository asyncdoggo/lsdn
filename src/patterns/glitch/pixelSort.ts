export class PixelSortPattern {
  /**
   * Generates pixel sorting glitch effects with organized disorder
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with gradient base
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Create base gradient with noise
        const gradientX = (x / width) * 255;
        const gradientY = (y / height) * 255;
        const noise = (Math.random() - 0.5) * 50;
        
        data[index] = Math.max(0, Math.min(255, gradientX + noise));
        data[index + 1] = Math.max(0, Math.min(255, gradientY + noise));
        data[index + 2] = Math.max(0, Math.min(255, (gradientX + gradientY) / 2 + noise));
        data[index + 3] = 255;
      }
    }
    
    // Apply pixel sorting to random rows
    const sortedRows = Math.floor(height * 0.3);
    
    for (let i = 0; i < sortedRows; i++) {
      const y = Math.floor(Math.random() * height);
      const startX = Math.floor(Math.random() * width * 0.3);
      const endX = startX + Math.floor(Math.random() * width * 0.4) + width * 0.3;
      
      this.sortPixelRow(data, width, y, startX, Math.min(endX, width - 1));
    }
    
    // Apply pixel sorting to random columns
    const sortedCols = Math.floor(width * 0.2);
    
    for (let i = 0; i < sortedCols; i++) {
      const x = Math.floor(Math.random() * width);
      const startY = Math.floor(Math.random() * height * 0.3);
      const endY = startY + Math.floor(Math.random() * height * 0.4) + height * 0.3;
      
      this.sortPixelColumn(data, width, x, startY, Math.min(endY, height - 1));
    }
    
    // Add some random sorting artifacts
    const artifactCount = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < artifactCount; i++) {
      const blockX = Math.floor(Math.random() * width);
      const blockY = Math.floor(Math.random() * height);
      const blockWidth = 10 + Math.floor(Math.random() * 50);
      const blockHeight = 5 + Math.floor(Math.random() * 20);
      
      this.sortPixelBlock(data, width, height, blockX, blockY, blockWidth, blockHeight);
    }
  }

  private static sortPixelRow(data: Uint8ClampedArray, width: number, y: number, startX: number, endX: number): void {
    const pixels: Array<{ r: number, g: number, b: number, brightness: number }> = [];
    
    // Extract pixels
    for (let x = startX; x <= endX; x++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const brightness = r * 0.299 + g * 0.587 + b * 0.114;
      
      pixels.push({ r, g, b, brightness });
    }
    
    // Sort by brightness
    pixels.sort((a, b) => a.brightness - b.brightness);
    
    // Put sorted pixels back
    for (let i = 0; i < pixels.length; i++) {
      const x = startX + i;
      const index = (y * width + x) * 4;
      const pixel = pixels[i];
      
      data[index] = pixel.r;
      data[index + 1] = pixel.g;
      data[index + 2] = pixel.b;
    }
  }

  private static sortPixelColumn(data: Uint8ClampedArray, width: number, x: number, startY: number, endY: number): void {
    const pixels: Array<{ r: number, g: number, b: number, brightness: number }> = [];
    
    // Extract pixels
    for (let y = startY; y <= endY; y++) {
      const index = (y * width + x) * 4;
      const r = data[index];
      const g = data[index + 1];
      const b = data[index + 2];
      const brightness = r * 0.299 + g * 0.587 + b * 0.114;
      
      pixels.push({ r, g, b, brightness });
    }
    
    // Sort by brightness
    pixels.sort((a, b) => a.brightness - b.brightness);
    
    // Put sorted pixels back
    for (let i = 0; i < pixels.length; i++) {
      const y = startY + i;
      const index = (y * width + x) * 4;
      const pixel = pixels[i];
      
      data[index] = pixel.r;
      data[index + 1] = pixel.g;
      data[index + 2] = pixel.b;
    }
  }

  private static sortPixelBlock(data: Uint8ClampedArray, width: number, height: number, startX: number, startY: number, blockWidth: number, blockHeight: number): void {
    const pixels: Array<{ r: number, g: number, b: number, brightness: number, x: number, y: number }> = [];
    
    // Extract pixels from block
    for (let y = startY; y < Math.min(height, startY + blockHeight); y++) {
      for (let x = startX; x < Math.min(width, startX + blockWidth); x++) {
        const index = (y * width + x) * 4;
        const r = data[index];
        const g = data[index + 1];
        const b = data[index + 2];
        const brightness = r * 0.299 + g * 0.587 + b * 0.114;
        
        pixels.push({ r, g, b, brightness, x, y });
      }
    }
    
    // Sort by brightness
    pixels.sort((a, b) => a.brightness - b.brightness);
    
    // Put sorted pixels back in original positions
    for (let i = 0; i < pixels.length; i++) {
      const pixel = pixels[i];
      const index = (pixel.y * width + pixel.x) * 4;
      const sortedPixel = pixels[i];
      
      data[index] = sortedPixel.r;
      data[index + 1] = sortedPixel.g;
      data[index + 2] = sortedPixel.b;
    }
  }
}
