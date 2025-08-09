import type { Resolution } from '../../imageGenerator';

export class BodiesPattern {
  /**
   * Generates realistic human body patterns with curves and proportions
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;
      data[i + 1] = 255;
      data[i + 2] = 255;
      data[i + 3] = 255;
    }

    const numBodies = 1 + Math.floor(Math.random() * 3); // 1-3 bodies
    
    for (let body = 0; body < numBodies; body++) {
      // Random body position and size
      const bodyX = Math.random() * resolution.width;
      const bodyY = Math.random() * resolution.height;
      const bodyHeight = 200 + Math.random() * 300;
      const bodyWidth = bodyHeight * (0.25 + Math.random() * 0.15); // Realistic body proportions
      
      // Head positioning (1/8 of body height)
      const headRadius = bodyHeight * 0.08;
      const headY = bodyY - bodyHeight * 0.4;
      
      // Draw realistic human figure
      this.drawRealisticHead(data, resolution, bodyX, headY, headRadius);
      
      // Neck with curved connection
      const neckY = headY + headRadius;
      const neckHeight = bodyHeight * 0.08;
      this.drawRealisticNeck(data, resolution, bodyX, neckY, bodyWidth * 0.3, neckHeight);
      
      // Torso with realistic curves
      const torsoY = neckY + neckHeight;
      const torsoHeight = bodyHeight * 0.5;
      this.drawRealisticTorso(data, resolution, bodyX, torsoY, bodyWidth, torsoHeight);
      
      // Arms with natural curves
      const shoulderY = torsoY + torsoHeight * 0.1;
      const armLength = bodyHeight * 0.35;
      this.drawRealisticArm(data, resolution, bodyX - bodyWidth * 0.6, shoulderY, armLength, true); // Left arm
      this.drawRealisticArm(data, resolution, bodyX + bodyWidth * 0.6, shoulderY, armLength, false); // Right arm
      
      // Legs with realistic proportions
      const hipY = torsoY + torsoHeight;
      const legLength = bodyHeight * 0.45;
      this.drawRealisticLeg(data, resolution, bodyX - bodyWidth * 0.2, hipY, legLength, true); // Left leg
      this.drawRealisticLeg(data, resolution, bodyX + bodyWidth * 0.2, hipY, legLength, false); // Right leg
      
      // Add clothing details
      if (Math.random() > 0.4) {
        this.addClothingDetails(data, resolution, bodyX, torsoY, bodyWidth, torsoHeight);
      }
      
      // Add body contours and shading
      this.addBodyContours(data, resolution, bodyX, bodyY, bodyWidth, bodyHeight);
    }
  }

  // Core body drawing methods
  private static drawRealisticHead(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, radius: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const r = Math.round(radius);
    
    // Draw oval head shape
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const radiusX = r;
      const radiusY = r * 1.2; // Slightly oval
      
      const x = Math.round(cx + Math.cos(angle) * radiusX);
      const y = Math.round(cy + Math.sin(angle) * radiusY);
      
      this.setPixel(data, resolution, x, y);
    }
  }

  private static drawRealisticNeck(data: Uint8ClampedArray, resolution: Resolution, centerX: number, startY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const sy = Math.round(startY);
    const w = Math.round(width / 2);
    const h = Math.round(height);
    
    // Draw curved neck
    for (let y = 0; y < h; y++) {
      const t = y / h;
      const neckWidth = w * (1 + t * 0.3); // Widens towards shoulders
      
      this.setPixel(data, resolution, cx - Math.round(neckWidth), sy + y);
      this.setPixel(data, resolution, cx + Math.round(neckWidth), sy + y);
    }
  }

  private static drawRealisticTorso(data: Uint8ClampedArray, resolution: Resolution, centerX: number, startY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const sy = Math.round(startY);
    const w = Math.round(width / 2);
    const h = Math.round(height);
    
    // Draw torso with realistic curves
    for (let y = 0; y < h; y++) {
      const t = y / h;
      let torsoWidth;
      
      if (t < 0.3) {
        // Shoulders to chest
        torsoWidth = w * (1 - t * 0.2);
      } else if (t < 0.6) {
        // Chest to waist
        torsoWidth = w * (0.8 - (t - 0.3) * 0.3);
      } else {
        // Waist to hips
        torsoWidth = w * (0.5 + (t - 0.6) * 0.4);
      }
      
      this.setPixel(data, resolution, cx - Math.round(torsoWidth), sy + y);
      this.setPixel(data, resolution, cx + Math.round(torsoWidth), sy + y);
    }
    
    // Add shoulder line
    this.drawLine(data, resolution, cx - w, sy, cx + w, sy);
  }

  private static drawRealisticArm(data: Uint8ClampedArray, resolution: Resolution, startX: number, startY: number, length: number, isLeft: boolean): void {
    const sx = Math.round(startX);
    const sy = Math.round(startY);
    const len = Math.round(length);
    
    // Arm segments
    const upperArmLength = len * 0.55;
    const forearmLength = len * 0.45;
    
    // Upper arm with curve
    let currentX = sx;
    let currentY = sy;
    const armDirection = isLeft ? -0.3 : 0.3; // Natural arm angle
    
    for (let i = 0; i < upperArmLength; i += 2) {
      const t = i / upperArmLength;
      const armWidth = 8 - t * 3; // Tapers
      const curve = Math.sin(t * Math.PI) * 10;
      
      currentX += armDirection + (isLeft ? -curve * 0.1 : curve * 0.1);
      currentY += 1;
      
      for (let w = -armWidth; w <= armWidth; w++) {
        this.setPixel(data, resolution, Math.round(currentX + w), Math.round(currentY));
      }
    }
    
    // Elbow joint
    this.drawCircle(data, resolution, currentX, currentY, 6);
    
    // Forearm
    for (let i = 0; i < forearmLength; i += 2) {
      const t = i / forearmLength;
      const armWidth = 5 - t * 2;
      
      currentX += armDirection * 0.5;
      currentY += 1.2;
      
      for (let w = -armWidth; w <= armWidth; w++) {
        this.setPixel(data, resolution, Math.round(currentX + w), Math.round(currentY));
      }
    }
    
    // Hand
    this.drawCircle(data, resolution, currentX, currentY, 4);
  }

  private static drawRealisticLeg(data: Uint8ClampedArray, resolution: Resolution, startX: number, startY: number, length: number, isLeft: boolean): void {
    const sx = Math.round(startX);
    const sy = Math.round(startY);
    const len = Math.round(length);
    
    // Leg segments
    const thighLength = len * 0.55;
    const shinLength = len * 0.45;
    
    // Thigh
    let currentX = sx;
    let currentY = sy;
    
    for (let i = 0; i < thighLength; i += 2) {
      const t = i / thighLength;
      const legWidth = 12 - t * 4; // Tapers
      
      currentY += 1;
      
      for (let w = -legWidth; w <= legWidth; w++) {
        this.setPixel(data, resolution, Math.round(currentX + w), Math.round(currentY));
      }
    }
    
    // Knee joint
    this.drawCircle(data, resolution, currentX, currentY, 8);
    
    // Shin
    for (let i = 0; i < shinLength; i += 2) {
      const t = i / shinLength;
      const legWidth = 8 - t * 3;
      
      currentY += 1.2;
      
      for (let w = -legWidth; w <= legWidth; w++) {
        this.setPixel(data, resolution, Math.round(currentX + w), Math.round(currentY));
      }
    }
    
    // Foot
    const footLength = 20;
    const footDirection = isLeft ? -1 : 1;
    
    for (let i = 0; i < footLength; i++) {
      const footWidth = 6 - Math.abs(i - footLength / 2) * 0.3;
      
      for (let w = -footWidth; w <= footWidth; w++) {
        this.setPixel(data, resolution, Math.round(currentX + i * footDirection + w), Math.round(currentY + w * 0.2));
      }
    }
  }

  private static addClothingDetails(data: Uint8ClampedArray, resolution: Resolution, centerX: number, torsoY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const ty = Math.round(torsoY);
    const w = Math.round(width / 2);
    const h = Math.round(height);
    
    // Shirt neckline
    const necklineWidth = w * 0.4;
    const necklineDepth = h * 0.15;
    
    for (let angle = 0; angle < Math.PI; angle += 0.1) {
      const x = Math.round(cx + Math.cos(angle) * necklineWidth);
      const y = Math.round(ty + Math.sin(angle) * necklineDepth);
      this.setPixel(data, resolution, x, y);
    }
    
    // Belt line
    const beltY = ty + h * 0.7;
    this.drawLine(data, resolution, cx - w * 0.9, beltY, cx + w * 0.9, beltY);
    
    // Pocket details
    if (Math.random() > 0.5) {
      const pocketX = cx + w * 0.3;
      const pocketY = ty + h * 0.3;
      const pocketSize = w * 0.2;
      
      this.drawLine(data, resolution, pocketX - pocketSize, pocketY, pocketX + pocketSize, pocketY);
      this.drawLine(data, resolution, pocketX - pocketSize, pocketY, pocketX - pocketSize, pocketY + pocketSize);
      this.drawLine(data, resolution, pocketX + pocketSize, pocketY, pocketX + pocketSize, pocketY + pocketSize);
    }
  }

  private static addBodyContours(data: Uint8ClampedArray, resolution: Resolution, centerX: number, centerY: number, width: number, height: number): void {
    const cx = Math.round(centerX);
    const cy = Math.round(centerY);
    const w = Math.round(width / 2);
    const h = Math.round(height / 2);
    
    // Body outline shading
    for (let y = -h; y < h; y++) {
      const t = (y + h) / (2 * h);
      let bodyWidth;
      
      if (t < 0.2) {
        bodyWidth = w * 0.8; // Shoulders
      } else if (t < 0.6) {
        bodyWidth = w * (0.8 - (t - 0.2) * 0.3); // Tapering to waist
      } else {
        bodyWidth = w * (0.5 + (t - 0.6) * 0.4); // Hips
      }
      
      // Light contour lines
      if (Math.random() > 0.7) {
        this.setPixel(data, resolution, cx - Math.round(bodyWidth * 0.9), cy + y);
        this.setPixel(data, resolution, cx + Math.round(bodyWidth * 0.9), cy + y);
      }
    }
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
