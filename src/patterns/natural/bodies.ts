import type { Resolution } from '../../imageGenerator';

export class BodiesPattern {
  /**
   * Generates simple abstract human figure patterns
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to light background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 245;
      data[i + 1] = 245;
      data[i + 2] = 245;
      data[i + 3] = 255;
    }

    // Create multiple simple figure abstractions across the canvas
    const figureHeight = Math.max(80, Math.min(200, Math.floor(Math.sqrt(resolution.width * resolution.height) / 8)));
    const figureWidth = figureHeight * 0.4;
    const numFiguresX = Math.floor(resolution.width / (figureWidth * 2));
    const numFiguresY = Math.floor(resolution.height / (figureHeight * 1.2));
    
    // Limit total figures for performance
    const maxFigures = 15;
    if (numFiguresX * numFiguresY > maxFigures) {
      this.generateSingleFigure(data, resolution);
      return;
    }
    
    for (let row = 0; row < numFiguresY; row++) {
      for (let col = 0; col < numFiguresX; col++) {
        const centerX = (col + 0.5) * (figureWidth * 2);
        const centerY = (row + 0.5) * (figureHeight * 1.2);
        
        const figureType = Math.floor(Math.random() * 3);
        this.drawSimpleFigure(data, resolution, centerX, centerY, figureWidth, figureHeight, figureType);
      }
    }
  }

  /**
   * Generate a single large figure for high resolutions
   */
  private static generateSingleFigure(data: Uint8ClampedArray, resolution: Resolution): void {
    const centerX = resolution.width / 2;
    const centerY = resolution.height / 2;
    const figureHeight = Math.min(resolution.width, resolution.height) * 0.6;
    const figureWidth = figureHeight * 0.3;
    
    this.drawSimpleFigure(data, resolution, centerX, centerY, figureWidth, figureHeight, Math.floor(Math.random() * 3));
  }

  /**
   * Draw a simple abstract human figure
   */
  private static drawSimpleFigure(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number,
    height: number,
    type: number
  ): void {
    // Simple proportions (8 heads tall)
    const headSize = height / 8;
    const headY = centerY - height * 0.375;
    const shoulderY = headY + headSize * 1.5;
    const waistY = centerY - headSize;
    const hipY = centerY + headSize;
    const footY = centerY + height * 0.375;
    
    // Head (simple circle)
    this.drawCircle(data, resolution, centerX, headY, headSize * 0.5, 80);
    
    // Body (simple rectangle or shapes based on type)
    switch (type) {
      case 0: // Stick figure
        this.drawStickFigure(data, resolution, centerX, shoulderY, waistY, hipY, footY, width);
        break;
      case 1: // Simple geometric figure
        this.drawGeometricFigure(data, resolution, centerX, shoulderY, waistY, hipY, footY, width);
        break;
      case 2: // Abstract figure
        this.drawAbstractFigure(data, resolution, centerX, shoulderY, waistY, hipY, footY, width);
        break;
    }
  }

  /**
   * Draw a stick figure
   */
  private static drawStickFigure(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    _waistY: number, 
    hipY: number, 
    footY: number,
    width: number
  ): void {
    // Torso (vertical line)
    this.drawVerticalLine(data, resolution, centerX, shoulderY, hipY, 80);
    
    // Arms (horizontal line)
    const armSpread = width * 0.6;
    const armY = shoulderY + (hipY - shoulderY) * 0.2;
    this.drawHorizontalLine(data, resolution, centerX - armSpread, centerX + armSpread, armY, 80);
    
    // Legs (diagonal lines)
    const legSpread = width * 0.4;
    this.drawLine(data, resolution, centerX, hipY, centerX - legSpread, footY, 80);
    this.drawLine(data, resolution, centerX, hipY, centerX + legSpread, footY, 80);
    
    // Hands (small circles)
    this.drawFilledCircle(data, resolution, centerX - armSpread, armY, 3, 70);
    this.drawFilledCircle(data, resolution, centerX + armSpread, armY, 3, 70);
    
    // Feet (small rectangles)
    this.drawHorizontalLine(data, resolution, centerX - legSpread - 5, centerX - legSpread + 5, footY, 70);
    this.drawHorizontalLine(data, resolution, centerX + legSpread - 5, centerX + legSpread + 5, footY, 70);
  }

  /**
   * Draw a geometric figure
   */
  private static drawGeometricFigure(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    _waistY: number, 
    hipY: number, 
    footY: number,
    width: number
  ): void {
    // Torso (rectangle)
    const torsoWidth = width * 0.6;
    this.drawRectangle(data, resolution, centerX, (shoulderY + hipY) / 2, torsoWidth, hipY - shoulderY, 90);
    
    // Arms (rectangles)
    const armWidth = width * 0.15;
    const armLength = _waistY - shoulderY;
    this.drawRectangle(data, resolution, centerX - torsoWidth/2 - armWidth, shoulderY + armLength/2, armWidth, armLength, 90);
    this.drawRectangle(data, resolution, centerX + torsoWidth/2 + armWidth, shoulderY + armLength/2, armWidth, armLength, 90);
    
    // Legs (rectangles)
    const legWidth = width * 0.2;
    const legLength = footY - hipY;
    this.drawRectangle(data, resolution, centerX - legWidth, hipY + legLength/2, legWidth, legLength, 90);
    this.drawRectangle(data, resolution, centerX + legWidth, hipY + legLength/2, legWidth, legLength, 90);
  }

  /**
   * Draw an abstract figure
   */
  private static drawAbstractFigure(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    _waistY: number, 
    hipY: number, 
    footY: number,
    width: number
  ): void {
    // Torso (oval)
    const torsoWidth = width * 0.5;
    const torsoHeight = hipY - shoulderY;
    this.drawOval(data, resolution, centerX, (shoulderY + hipY) / 2, torsoWidth, torsoHeight, 100);
    
    // Arms (curved lines or ovals)
    const armRadius = width * 0.1;
    this.drawOval(data, resolution, centerX - torsoWidth/2 - armRadius, shoulderY + torsoHeight/3, armRadius, torsoHeight/3, 100);
    this.drawOval(data, resolution, centerX + torsoWidth/2 + armRadius, shoulderY + torsoHeight/3, armRadius, torsoHeight/3, 100);
    
    // Legs (ovals)
    const legWidth = width * 0.15;
    const legHeight = (footY - hipY) * 0.8;
    this.drawOval(data, resolution, centerX - legWidth, hipY + legHeight/2, legWidth, legHeight, 100);
    this.drawOval(data, resolution, centerX + legWidth, hipY + legHeight/2, legWidth, legHeight, 100);
  }

  /**
   * Draw a simple circle outline
   */
  private static drawCircle(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    value: number
  ): void {
    const radiusInt = Math.round(radius);
    for (let angle = 0; angle < Math.PI * 2; angle += 0.3) {
      const x = Math.round(centerX + Math.cos(angle) * radiusInt);
      const y = Math.round(centerY + Math.sin(angle) * radiusInt);
      this.setPixel(data, resolution, x, y, value);
    }
  }

  /**
   * Draw a filled circle
   */
  private static drawFilledCircle(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    value: number
  ): void {
    const radiusInt = Math.round(radius);
    for (let y = -radiusInt; y <= radiusInt; y++) {
      for (let x = -radiusInt; x <= radiusInt; x++) {
        if (x * x + y * y <= radiusInt * radiusInt) {
          this.setPixel(data, resolution, centerX + x, centerY + y, value);
        }
      }
    }
  }

  /**
   * Draw a rectangle outline
   */
  private static drawRectangle(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number, 
    value: number
  ): void {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Top and bottom lines
    this.drawHorizontalLine(data, resolution, centerX - halfWidth, centerX + halfWidth, centerY - halfHeight, value);
    this.drawHorizontalLine(data, resolution, centerX - halfWidth, centerX + halfWidth, centerY + halfHeight, value);
    
    // Left and right lines
    this.drawVerticalLine(data, resolution, centerX - halfWidth, centerY - halfHeight, centerY + halfHeight, value);
    this.drawVerticalLine(data, resolution, centerX + halfWidth, centerY - halfHeight, centerY + halfHeight, value);
  }

  /**
   * Draw an oval outline
   */
  private static drawOval(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    radiusX: number, 
    radiusY: number, 
    value: number
  ): void {
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
      const x = Math.round(centerX + Math.cos(angle) * radiusX);
      const y = Math.round(centerY + Math.sin(angle) * radiusY);
      this.setPixel(data, resolution, x, y, value);
    }
  }

  /**
   * Draw a horizontal line
   */
  private static drawHorizontalLine(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    x1: number, 
    x2: number, 
    y: number, 
    value: number
  ): void {
    const startX = Math.round(Math.min(x1, x2));
    const endX = Math.round(Math.max(x1, x2));
    const lineY = Math.round(y);
    
    for (let x = startX; x <= endX; x++) {
      this.setPixel(data, resolution, x, lineY, value);
    }
  }

  /**
   * Draw a vertical line
   */
  private static drawVerticalLine(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    x: number, 
    y1: number, 
    y2: number, 
    value: number
  ): void {
    const startY = Math.round(Math.min(y1, y2));
    const endY = Math.round(Math.max(y1, y2));
    const lineX = Math.round(x);
    
    for (let y = startY; y <= endY; y++) {
      this.setPixel(data, resolution, lineX, y, value);
    }
  }

  /**
   * Draw a line between two points
   */
  private static drawLine(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    x1: number, 
    y1: number, 
    x2: number, 
    y2: number, 
    value: number
  ): void {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    let currentX = Math.round(x1);
    let currentY = Math.round(y1);
    const endX = Math.round(x2);
    const endY = Math.round(y2);
    
    // Limit iterations to prevent infinite loops
    let iterations = 0;
    const maxIterations = Math.max(dx, dy) + 1;
    
    while (iterations < maxIterations) {
      this.setPixel(data, resolution, currentX, currentY, value);
      
      if (currentX === endX && currentY === endY) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currentX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currentY += sy;
      }
      iterations++;
    }
  }

  /**
   * Helper function to set a pixel safely
   */
  private static setPixel(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    x: number, 
    y: number, 
    value: number
  ): void {
    const pixelX = Math.round(x);
    const pixelY = Math.round(y);
    
    if (pixelX >= 0 && pixelX < resolution.width && pixelY >= 0 && pixelY < resolution.height) {
      const index = (pixelY * resolution.width + pixelX) * 4;
      data[index] = value;
      data[index + 1] = value;
      data[index + 2] = value;
      data[index + 3] = 255;
    }
  }
}
