import type { Resolution } from '../../imageGenerator';

export class FacesPattern {
  /**
   * Generates simple abstract face patterns inspired by human faces
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to light background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 240;
      data[i + 1] = 240;
      data[i + 2] = 240;
      data[i + 3] = 255;
    }

    // Create multiple simple face abstractions across the canvas
    const faceSize = Math.max(60, Math.min(150, Math.floor(Math.sqrt(resolution.width * resolution.height) / 15)));
    const numFacesX = Math.floor(resolution.width / (faceSize * 1.5));
    const numFacesY = Math.floor(resolution.height / (faceSize * 1.5));
    
    // Limit total faces for performance
    const maxFaces = 25;
    if (numFacesX * numFacesY > maxFaces) {
      this.generateSingleFace(data, resolution);
      return;
    }
    
    for (let row = 0; row < numFacesY; row++) {
      for (let col = 0; col < numFacesX; col++) {
        const centerX = (col + 0.5) * (faceSize * 1.5);
        const centerY = (row + 0.5) * (faceSize * 1.5);
        
        const faceType = Math.floor(Math.random() * 3);
        this.drawSimpleFace(data, resolution, centerX, centerY, faceSize, faceType);
      }
    }
  }

  /**
   * Generate a single large face for high resolutions
   */
  private static generateSingleFace(data: Uint8ClampedArray, resolution: Resolution): void {
    const centerX = resolution.width / 2;
    const centerY = resolution.height / 2;
    const faceSize = Math.min(resolution.width, resolution.height) * 0.4;
    
    this.drawSimpleFace(data, resolution, centerX, centerY, faceSize, Math.floor(Math.random() * 3));
  }

  /**
   * Draw a simple abstract face
   */
  private static drawSimpleFace(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    size: number,
    type: number
  ): void {
    const halfSize = size / 2;
    
    // Face outline (simple circle or oval)
    const faceRadius = halfSize * 0.8;
    this.drawCircle(data, resolution, centerX, centerY, faceRadius, 100);
    
    // Eyes - simple dots or shapes
    const eyeY = centerY - halfSize * 0.2;
    const eyeSpacing = halfSize * 0.4;
    const eyeSize = size * 0.05;
    
    switch (type) {
      case 0: // Round eyes
        this.drawFilledCircle(data, resolution, centerX - eyeSpacing, eyeY, eyeSize, 50);
        this.drawFilledCircle(data, resolution, centerX + eyeSpacing, eyeY, eyeSize, 50);
        break;
      case 1: // Square eyes
        this.drawSquare(data, resolution, centerX - eyeSpacing, eyeY, eyeSize, 50);
        this.drawSquare(data, resolution, centerX + eyeSpacing, eyeY, eyeSize, 50);
        break;
      case 2: // Line eyes
        this.drawHorizontalLine(data, resolution, centerX - eyeSpacing - eyeSize, centerX - eyeSpacing + eyeSize, eyeY, 50);
        this.drawHorizontalLine(data, resolution, centerX + eyeSpacing - eyeSize, centerX + eyeSpacing + eyeSize, eyeY, 50);
        break;
    }
    
    // Nose - simple line or dot
    const noseY = centerY + halfSize * 0.1;
    if (type === 0) {
      this.drawVerticalLine(data, resolution, centerX, noseY - eyeSize, noseY + eyeSize, 80);
    } else {
      this.drawFilledCircle(data, resolution, centerX, noseY, eyeSize * 0.5, 80);
    }
    
    // Mouth - simple curve or line
    const mouthY = centerY + halfSize * 0.4;
    const mouthWidth = halfSize * 0.6;
    
    if (type === 2) {
      // Curved mouth
      this.drawSimpleCurve(data, resolution, centerX, mouthY, mouthWidth, 70);
    } else {
      // Straight mouth
      this.drawHorizontalLine(data, resolution, centerX - mouthWidth/2, centerX + mouthWidth/2, mouthY, 70);
    }
    
    // Simple hair indication
    if (Math.random() > 0.5) {
      const hairY = centerY - halfSize;
      this.drawHorizontalLine(data, resolution, centerX - faceRadius, centerX + faceRadius, hairY, 60);
    }
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
    for (let angle = 0; angle < Math.PI * 2; angle += 0.2) {
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
   * Draw a simple square
   */
  private static drawSquare(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    size: number, 
    value: number
  ): void {
    const halfSize = Math.round(size);
    for (let y = -halfSize; y <= halfSize; y++) {
      for (let x = -halfSize; x <= halfSize; x++) {
        this.setPixel(data, resolution, centerX + x, centerY + y, value);
      }
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
   * Draw a simple curve for mouth
   */
  private static drawSimpleCurve(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    value: number
  ): void {
    const halfWidth = width / 2;
    const steps = Math.round(width / 2);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = centerX + (t - 0.5) * width;
      const y = centerY + Math.sin(t * Math.PI) * halfWidth * 0.2;
      this.setPixel(data, resolution, x, y, value);
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
