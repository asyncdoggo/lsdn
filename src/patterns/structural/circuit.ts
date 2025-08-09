import type { Resolution } from '../../imageGenerator';

export class CircuitPattern {
  /**
   * Generates circuit board-like patterns with traces and components
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Fill with dark green circuit board background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 20;      // R
      data[i + 1] = 60;  // G
      data[i + 2] = 20;  // B
      data[i + 3] = 255; // A
    }
    
    // Generate circuit traces (horizontal and vertical lines)
    const traceCount = 20 + Math.floor(Math.random() * 30);
    
    for (let i = 0; i < traceCount; i++) {
      const isHorizontal = Math.random() > 0.5;
      const traceWidth = 2 + Math.floor(Math.random() * 3);
      
      if (isHorizontal) {
        const y = Math.floor(Math.random() * resolution.height);
        const startX = Math.floor(Math.random() * resolution.width * 0.3);
        const endX = startX + Math.floor(Math.random() * resolution.width * 0.4) + resolution.width * 0.3;
        
        this.drawHorizontalTrace(data, resolution, startX, endX, y, traceWidth);
      } else {
        const x = Math.floor(Math.random() * resolution.width);
        const startY = Math.floor(Math.random() * resolution.height * 0.3);
        const endY = startY + Math.floor(Math.random() * resolution.height * 0.4) + resolution.height * 0.3;
        
        this.drawVerticalTrace(data, resolution, x, startY, endY, traceWidth);
      }
    }
    
    // Add circuit components (rectangles and circles)
    const componentCount = 10 + Math.floor(Math.random() * 15);
    
    for (let i = 0; i < componentCount; i++) {
      const x = Math.floor(Math.random() * (resolution.width - 40)) + 20;
      const y = Math.floor(Math.random() * (resolution.height - 30)) + 15;
      const width = 10 + Math.floor(Math.random() * 25);
      const height = 8 + Math.floor(Math.random() * 15);
      
      if (Math.random() > 0.6) {
        // Rectangular component (IC, resistor, etc.)
        this.drawRectangleComponent(data, resolution, x, y, width, height);
      } else {
        // Circular component (capacitor, etc.)
        this.drawCircularComponent(data, resolution, x, y, Math.min(width, height) / 2);
      }
    }
    
    // Add via holes (small circles)
    const viaCount = 15 + Math.floor(Math.random() * 25);
    
    for (let i = 0; i < viaCount; i++) {
      const x = Math.floor(Math.random() * resolution.width);
      const y = Math.floor(Math.random() * resolution.height);
      const radius = 2 + Math.floor(Math.random() * 3);
      
      this.drawVia(data, resolution, x, y, radius);
    }
  }

  private static drawHorizontalTrace(data: Uint8ClampedArray, resolution: Resolution, startX: number, endX: number, y: number, width: number): void {
    for (let x = Math.max(0, startX); x <= Math.min(resolution.width - 1, endX); x++) {
      for (let w = 0; w < width; w++) {
        const traceY = y + w - width / 2;
        if (traceY >= 0 && traceY < resolution.height) {
          const index = (Math.floor(traceY) * resolution.width + x) * 4;
          data[index] = 200;     // R - copper color
          data[index + 1] = 150; // G
          data[index + 2] = 50;  // B
        }
      }
    }
  }

  private static drawVerticalTrace(data: Uint8ClampedArray, resolution: Resolution, x: number, startY: number, endY: number, width: number): void {
    for (let y = Math.max(0, startY); y <= Math.min(resolution.height - 1, endY); y++) {
      for (let w = 0; w < width; w++) {
        const traceX = x + w - width / 2;
        if (traceX >= 0 && traceX < resolution.width) {
          const index = (y * resolution.width + Math.floor(traceX)) * 4;
          data[index] = 200;     // R - copper color
          data[index + 1] = 150; // G
          data[index + 2] = 50;  // B
        }
      }
    }
  }

  private static drawRectangleComponent(data: Uint8ClampedArray, resolution: Resolution, x: number, y: number, width: number, height: number): void {
    for (let py = 0; py < height; py++) {
      for (let px = 0; px < width; px++) {
        const componentX = x + px;
        const componentY = y + py;
        
        if (componentX >= 0 && componentX < resolution.width && componentY >= 0 && componentY < resolution.height) {
          const index = (componentY * resolution.width + componentX) * 4;
          
          // Dark gray component body
          if (px === 0 || px === width - 1 || py === 0 || py === height - 1) {
            // Component outline
            data[index] = 100;     // R
            data[index + 1] = 100; // G
            data[index + 2] = 100; // B
          } else {
            // Component fill
            data[index] = 80;      // R
            data[index + 1] = 80;  // G
            data[index + 2] = 80;  // B
          }
        }
      }
    }
  }

  private static drawCircularComponent(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const distance = Math.sqrt(x * x + y * y);
        
        if (distance <= radius) {
          const componentX = centerX + x;
          const componentY = centerY + y;
          
          if (componentX >= 0 && componentX < resolution.width && componentY >= 0 && componentY < resolution.height) {
            const index = (componentY * resolution.width + componentX) * 4;
            
            if (distance > radius - 1) {
              // Component outline
              data[index] = 120;     // R
              data[index + 1] = 120; // G
              data[index + 2] = 120; // B
            } else {
              // Component fill
              data[index] = 90;      // R
              data[index + 1] = 90;  // G
              data[index + 2] = 90;  // B
            }
          }
        }
      }
    }
  }

  private static drawVia(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const distance = Math.sqrt(x * x + y * y);
        
        if (distance <= radius) {
          const viaX = centerX + x;
          const viaY = centerY + y;
          
          if (viaX >= 0 && viaX < resolution.width && viaY >= 0 && viaY < resolution.height) {
            const index = (viaY * resolution.width + viaX) * 4;
            
            // Silver via hole
            data[index] = 180;     // R
            data[index + 1] = 180; // G
            data[index + 2] = 180; // B
          }
        }
      }
    }
  }
}
