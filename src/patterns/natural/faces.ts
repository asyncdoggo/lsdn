import type { Resolution } from '../../imageGenerator';

export class FacesPattern {
  /**
   * Generates realistic face patterns with curves and shading
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const numFaces = 2 + Math.floor(Math.random() * 4); // 2-5 faces
    
    for (let face = 0; face < numFaces; face++) {
      // Random face position and size
      const faceX = Math.random() * resolution.width;
      const faceY = Math.random() * resolution.height;
      const faceWidth = 120 + Math.random() * 180;
      const faceHeight = faceWidth * (1.2 + Math.random() * 0.4); // Realistic face proportions
      
      // Draw realistic face outline with curves
      this.drawRealisticFaceOutline(data, resolution, faceX, faceY, faceWidth, faceHeight);
      
      // Eyes with realistic positioning (rule of thirds)
      const eyeY = faceY - faceHeight * 0.15;
      const eyeSpacing = faceWidth * 0.25;
      const eyeWidth = faceWidth * 0.12;
      const eyeHeight = eyeWidth * 0.6;
      
      // Left eye with realistic almond shape
      const leftEyeX = faceX - eyeSpacing;
      this.drawRealisticEye(data, resolution, leftEyeX, eyeY, eyeWidth, eyeHeight);
      
      // Right eye
      const rightEyeX = faceX + eyeSpacing;
      this.drawRealisticEye(data, resolution, rightEyeX, eyeY, eyeWidth, eyeHeight);
      
      // Eyebrows
      this.drawEyebrow(data, resolution, leftEyeX, eyeY - eyeHeight * 1.2, eyeWidth * 1.1);
      this.drawEyebrow(data, resolution, rightEyeX, eyeY - eyeHeight * 1.2, eyeWidth * 1.1);
      
      // Nose with realistic curves
      const noseY = faceY + faceHeight * 0.05;
      const noseWidth = faceWidth * 0.08;
      const noseHeight = faceHeight * 0.15;
      this.drawRealisticNose(data, resolution, faceX, noseY, noseWidth, noseHeight);
      
      // Mouth with realistic curves
      const mouthY = faceY + faceHeight * 0.25;
      const mouthWidth = faceWidth * (0.15 + Math.random() * 0.1);
      const mouthStyle = Math.floor(Math.random() * 4);
      this.drawRealisticMouth(data, resolution, faceX, mouthY, mouthWidth, mouthStyle);
      
      // Hair with flowing curves
      if (Math.random() > 0.3) {
        const hairStyle = Math.floor(Math.random() * 3);
        this.drawRealisticHair(data, resolution, faceX, faceY, faceWidth, faceHeight, hairStyle);
      }
      
      // Facial contours and shading
      this.addFacialContours(data, resolution, faceX, faceY, faceWidth, faceHeight);
      
      // Accessories (sometimes)
      if (Math.random() > 0.7) {
        this.drawRealisticGlasses(data, resolution, faceX, eyeY, eyeSpacing, eyeWidth);
      }
    }
  }

  // Core face drawing methods (simplified versions)
  private static drawRealisticFaceOutline(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(width / 2);
    const h = Math.round(height / 2);
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
      const jawWidth = Math.sin(angle) < 0 ? 0.8 : 1.0;
      const templeWidth = Math.abs(Math.sin(angle)) > 0.7 ? 0.9 : 1.0;
      
      const radiusX = w * jawWidth * templeWidth;
      const radiusY = h;
      
      const x = Math.round(cx + Math.cos(angle) * radiusX);
      const y = Math.round(cy + Math.sin(angle) * radiusY);
      
      this.setPixel(data, resolution, x, y);
    }
  }

  private static drawRealisticEye(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(width / 2);
    const h = Math.round(height / 2);
    
    // Almond-shaped eye
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const almondFactor = 1 + Math.cos(angle * 2) * 0.3;
      const x = Math.round(cx + Math.cos(angle) * w * almondFactor);
      const y = Math.round(cy + Math.sin(angle) * h);
      this.setPixel(data, resolution, x, y);
    }
    
    // Iris and pupil
    this.drawCircle(data, resolution, cx, cy, Math.min(w, h) * 0.7);
    this.fillCircle(data, resolution, cx, cy, Math.min(w, h) * 0.3);
  }

  private static drawEyebrow(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, width: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(width / 2);
    
    for (let x = -w; x <= w; x++) {
      const t = x / w;
      const thickness = Math.max(1, Math.round(3 * (1 - Math.abs(t))));
      const curve = Math.sin(t * Math.PI * 0.3) * 3;
      
      for (let thick = 0; thick < thickness; thick++) {
        this.setPixel(data, resolution, cx + x, cy + Math.round(curve) - thick);
      }
    }
  }

  private static drawRealisticNose(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(width / 2);
    const h = Math.round(height);
    
    for (let y = 0; y < h; y++) {
      const t = y / h;
      const noseWidth = w * (0.3 + t * 0.7);
      
      this.setPixel(data, resolution, cx - Math.round(noseWidth), cy + y);
      this.setPixel(data, resolution, cx + Math.round(noseWidth), cy + y);
    }
    
    // Nostrils
    this.drawCircle(data, resolution, cx - w * 0.6, cy + h * 0.8, w * 0.2);
    this.drawCircle(data, resolution, cx + w * 0.6, cy + h * 0.8, w * 0.2);
  }

  private static drawRealisticMouth(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, width: number, style: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(width / 2);
    
    for (let x = -w; x <= w; x++) {
      const t = x / w;
      let curve = 0;
      
      switch (style) {
        case 0: curve = Math.sin(t * Math.PI) * 2; break;
        case 1: curve = -Math.sin(t * Math.PI) * w * 0.3; break;
        case 2: curve = Math.sin(t * Math.PI) * w * 0.2; break;
        case 3: 
          this.setPixel(data, resolution, cx + x, cy - Math.round(Math.sin(t * Math.PI) * w * 0.2));
          this.setPixel(data, resolution, cx + x, cy + Math.round(Math.sin(t * Math.PI) * w * 0.3) + 5);
          continue;
      }
      
      this.setPixel(data, resolution, cx + x, cy + Math.round(curve));
    }
  }

  private static drawRealisticHair(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, faceWidth: number, faceHeight: number, style: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(faceWidth / 2);
    const h = Math.round(faceHeight / 2);
    
    for (let angle = Math.PI * 0.1; angle <= Math.PI * 0.9; angle += 0.1) {
      const hairLength = h * (0.8 + Math.random() * (style === 1 ? 1.5 : 0.6));
      let currentX = cx + Math.cos(angle + Math.PI) * w;
      let currentY = cy + Math.sin(angle + Math.PI) * h;
      
      for (let len = 0; len < hairLength; len += 2) {
        if (style === 2) { // Curly
          const curlX = Math.sin(len * 0.3) * 8;
          const curlY = Math.cos(len * 0.3) * 4;
          this.setPixel(data, resolution, Math.round(currentX + curlX), Math.round(currentY + curlY + len * 0.8));
        } else {
          if (style === 1) { // Flowing
            const wave = Math.sin(len * 0.1) * 10;
            currentX += Math.cos(angle + Math.PI) * 0.5 + wave * 0.1;
            currentY += 1 + Math.random() * 0.5;
          } else {
            currentX += Math.cos(angle + Math.PI) * 2;
            currentY += Math.sin(angle + Math.PI) * 2;
          }
          this.setPixel(data, resolution, Math.round(currentX), Math.round(currentY));
        }
      }
    }
  }

  private static addFacialContours(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(width / 2);
    const h = Math.round(height / 2);
    
    // Cheekbones and jawline
    this.drawLine(data, resolution, cx - w * 0.7, cy - h * 0.1, cx - w * 0.3, cy + h * 0.2);
    this.drawLine(data, resolution, cx + w * 0.7, cy - h * 0.1, cx + w * 0.3, cy + h * 0.2);
    this.drawLine(data, resolution, cx - w * 0.8, cy + h * 0.5, cx, cy + h * 0.9);
    this.drawLine(data, resolution, cx + w * 0.8, cy + h * 0.5, cx, cy + h * 0.9);
  }

  private static drawRealisticGlasses(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, eyeSpacing: number, eyeWidth: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const spacing = Math.round(eyeSpacing);
    const lensSize = Math.round(eyeWidth * 1.3);
    
    this.drawCircle(data, resolution, cx - spacing, cy, lensSize);
    this.drawCircle(data, resolution, cx + spacing, cy, lensSize);
    this.drawLine(data, resolution, cx - spacing + lensSize, cy, cx + spacing - lensSize, cy);
  }

  // Utility methods
  private static setPixel(data: Uint8ClampedArray, resolution: Resolution, x: number, y: number): void {
    if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
      const index = (y * resolution.width + x) * 4;
      data[index] = 0;
      data[index + 1] = 0;
      data[index + 2] = 0;
    }
  }

  private static drawCircle(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const r = Math.round(radius);
    
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      const x = Math.round(cx + Math.cos(angle) * r);
      const y = Math.round(cy + Math.sin(angle) * r);
      this.setPixel(data, resolution, x, y);
    }
  }

  private static fillCircle(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const r = Math.round(radius);
    
    for (let y = cy - r; y <= cy + r; y++) {
      for (let x = cx - r; x <= cx + r; x++) {
        const dx = x - cx;
        const dy = y - cy;
        if (dx * dx + dy * dy <= r * r) {
          this.setPixel(data, resolution, x, y);
        }
      }
    }
  }

  private static drawLine(data: Uint8ClampedArray, resolution: Resolution, x1: number, y1: number, x2: number, y2: number): void {
    const dx = Math.abs(x2 - x1);
    const dy = Math.abs(y2 - y1);
    const sx = x1 < x2 ? 1 : -1;
    const sy = y1 < y2 ? 1 : -1;
    let err = dx - dy;
    
    let x = Math.round(x1);
    let y = Math.round(y1);
    const endX = Math.round(x2);
    const endY = Math.round(y2);
    
    while (true) {
      this.setPixel(data, resolution, x, y);
      
      if (x === endX && y === endY) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        x += sx;
      }
      if (e2 < dx) {
        err += dx;
        y += sy;
      }
    }
  }
}
