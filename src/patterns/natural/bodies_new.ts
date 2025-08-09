import type { Resolution } from '../../imageGenerator';

export class BodiesPattern {
  /**
   * Generates a single detailed human body figure with proper proportions
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to light background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 248;
      data[i + 1] = 246;
      data[i + 2] = 242;
      data[i + 3] = 255;
    }

    // Center the figure with appropriate sizing
    const figureHeight = Math.min(resolution.width, resolution.height) * 0.8;
    const figureWidth = figureHeight * 0.3; // Realistic body proportions
    const centerX = resolution.width / 2;
    const centerY = resolution.height / 2;
    
    // Choose a random pose/style
    const bodyStyle = Math.floor(Math.random() * 3);
    
    // Draw the complete figure
    this.drawDetailedFigure(data, resolution, centerX, centerY, figureWidth, figureHeight, bodyStyle);
  }

  /**
   * Draw a complete detailed human figure
   */
  private static drawDetailedFigure(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number,
    style: number
  ): void {
    // Standard human proportions (8 heads tall)
    const headHeight = height / 8;
    const headWidth = headHeight * 0.7;
    
    // Body parts positioning
    const headY = centerY - height * 0.375; // Top of figure
    const neckY = headY + headHeight;
    const shoulderY = neckY + headHeight * 0.25;
    const chestY = shoulderY + headHeight * 0.5;
    const waistY = centerY - headHeight * 0.5;
    const hipY = centerY + headHeight * 0.25;
    const ankleY = centerY + height * 0.375;
    
    // Draw each body part
    this.drawHead(data, resolution, centerX, headY, headWidth, headHeight);
    this.drawNeck(data, resolution, centerX, neckY, headWidth * 0.4, headHeight * 0.25);
    this.drawTorso(data, resolution, centerX, shoulderY, waistY, width);
    this.drawArms(data, resolution, centerX, shoulderY, chestY, width, style);
    this.drawLegs(data, resolution, centerX, hipY, ankleY, width * 0.6, style);
    
    // Add clothing/details based on style
    this.addClothing(data, resolution, centerX, shoulderY, waistY, hipY, width, style);
  }

  /**
   * Draw detailed head
   */
  private static drawHead(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number
  ): void {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Head outline (oval shape)
    for (let angle = 0; angle < Math.PI * 2; angle += 0.02) {
      const x = Math.round(centerX + Math.cos(angle) * halfWidth);
      const y = Math.round(centerY + Math.sin(angle) * halfHeight);
      this.setPixel(data, resolution, x, y, 80);
    }
    
    // Simple facial features
    const eyeY = centerY - halfHeight * 0.2;
    const eyeSpacing = halfWidth * 0.4;
    
    // Eyes (small dots)
    this.drawThickPoint(data, resolution, centerX - eyeSpacing, eyeY, 2, 50);
    this.drawThickPoint(data, resolution, centerX + eyeSpacing, eyeY, 2, 50);
    
    // Nose (small line)
    for (let y = eyeY + halfHeight * 0.2; y < eyeY + halfHeight * 0.4; y++) {
      this.setPixel(data, resolution, centerX, y, 70);
    }
    
    // Mouth (curve)
    const mouthY = centerY + halfHeight * 0.3;
    for (let x = centerX - halfWidth * 0.3; x <= centerX + halfWidth * 0.3; x++) {
      const curve = Math.sin((x - centerX + halfWidth * 0.3) / (halfWidth * 0.6) * Math.PI) * halfHeight * 0.1;
      this.setPixel(data, resolution, x, mouthY - curve, 60);
    }
  }

  /**
   * Draw neck
   */
  private static drawNeck(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number
  ): void {
    const halfWidth = width / 2;
    
    // Simple rectangular neck
    for (let y = centerY; y < centerY + height; y++) {
      this.setPixel(data, resolution, centerX - halfWidth, y, 80);
      this.setPixel(data, resolution, centerX + halfWidth, y, 80);
    }
    
    // Neck base
    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
      this.setPixel(data, resolution, x, centerY + height, 80);
    }
  }

  /**
   * Draw torso with different poses
   */
  private static drawTorso(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    waistY: number, 
    width: number
  ): void {
    const shoulderWidth = width;
    const waistWidth = width * 0.7;
    
    // Left side of torso
    const leftShoulderX = centerX - shoulderWidth / 2;
    const leftWaistX = centerX - waistWidth / 2;
    
    for (let y = shoulderY; y <= waistY; y++) {
      const t = (y - shoulderY) / (waistY - shoulderY);
      const x = leftShoulderX + (leftWaistX - leftShoulderX) * t;
      this.setPixel(data, resolution, x, y, 80);
    }
    
    // Right side of torso
    const rightShoulderX = centerX + shoulderWidth / 2;
    const rightWaistX = centerX + waistWidth / 2;
    
    for (let y = shoulderY; y <= waistY; y++) {
      const t = (y - shoulderY) / (waistY - shoulderY);
      const x = rightShoulderX + (rightWaistX - rightShoulderX) * t;
      this.setPixel(data, resolution, x, y, 80);
    }
    
    // Shoulder line
    for (let x = leftShoulderX; x <= rightShoulderX; x++) {
      this.setPixel(data, resolution, x, shoulderY, 80);
    }
    
    // Waist line
    for (let x = leftWaistX; x <= rightWaistX; x++) {
      this.setPixel(data, resolution, x, waistY, 80);
    }
  }

  /**
   * Draw arms with different positions based on style
   */
  private static drawArms(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    torsoEndY: number, 
    bodyWidth: number,
    style: number
  ): void {
    const shoulderHalfWidth = bodyWidth / 2;
    const armLength = (torsoEndY - shoulderY) * 1.2;
    
    // Left arm
    let leftArmEndX = centerX - shoulderHalfWidth - armLength * 0.3;
    let leftArmEndY = shoulderY + armLength;
    
    // Right arm  
    let rightArmEndX = centerX + shoulderHalfWidth + armLength * 0.3;
    let rightArmEndY = shoulderY + armLength;
    
    // Different arm positions based on style
    switch (style) {
      case 0: // Arms at sides
        leftArmEndX = centerX - shoulderHalfWidth - armLength * 0.2;
        rightArmEndX = centerX + shoulderHalfWidth + armLength * 0.2;
        break;
      case 1: // Arms crossed
        leftArmEndX = centerX + bodyWidth * 0.2;
        leftArmEndY = shoulderY + armLength * 0.6;
        rightArmEndX = centerX - bodyWidth * 0.2;
        rightArmEndY = shoulderY + armLength * 0.6;
        break;
      case 2: // One arm raised
        leftArmEndX = centerX - shoulderHalfWidth - armLength * 0.5;
        leftArmEndY = shoulderY - armLength * 0.3;
        break;
    }
    
    // Draw left arm
    this.drawLine(data, resolution, 
      centerX - shoulderHalfWidth, shoulderY,
      leftArmEndX, leftArmEndY, 80);
    
    // Draw right arm
    this.drawLine(data, resolution,
      centerX + shoulderHalfWidth, shoulderY,
      rightArmEndX, rightArmEndY, 80);
    
    // Add hands (small circles)
    this.drawThickPoint(data, resolution, leftArmEndX, leftArmEndY, 3, 70);
    this.drawThickPoint(data, resolution, rightArmEndX, rightArmEndY, 3, 70);
  }

  /**
   * Draw legs with different stances
   */
  private static drawLegs(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    hipY: number, 
    ankleY: number, 
    hipWidth: number,
    style: number
  ): void {
    const legLength = ankleY - hipY;
    const kneeY = hipY + legLength * 0.5;
    
    // Hip positions
    const leftHipX = centerX - hipWidth / 2;
    const rightHipX = centerX + hipWidth / 2;
    
    // Ankle positions (different stances based on style)
    let leftAnkleX = leftHipX;
    let rightAnkleX = rightHipX;
    
    switch (style) {
      case 0: // Standing straight
        leftAnkleX = centerX - hipWidth * 0.3;
        rightAnkleX = centerX + hipWidth * 0.3;
        break;
      case 1: // Wide stance
        leftAnkleX = centerX - hipWidth * 0.8;
        rightAnkleX = centerX + hipWidth * 0.8;
        break;
      case 2: // One leg forward
        leftAnkleX = centerX - hipWidth * 0.2;
        rightAnkleX = centerX + hipWidth * 0.6;
        break;
    }
    
    // Left leg (hip to knee to ankle)
    this.drawLine(data, resolution, leftHipX, hipY, leftAnkleX - hipWidth * 0.1, kneeY, 80);
    this.drawLine(data, resolution, leftAnkleX - hipWidth * 0.1, kneeY, leftAnkleX, ankleY, 80);
    
    // Right leg (hip to knee to ankle)
    this.drawLine(data, resolution, rightHipX, hipY, rightAnkleX + hipWidth * 0.1, kneeY, 80);
    this.drawLine(data, resolution, rightAnkleX + hipWidth * 0.1, kneeY, rightAnkleX, ankleY, 80);
    
    // Add feet (small ovals)
    this.drawFoot(data, resolution, leftAnkleX, ankleY, hipWidth * 0.15);
    this.drawFoot(data, resolution, rightAnkleX, ankleY, hipWidth * 0.15);
  }

  /**
   * Add clothing details based on style
   */
  private static addClothing(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    waistY: number, 
    hipY: number, 
    bodyWidth: number,
    style: number
  ): void {
    switch (style) {
      case 0: // T-shirt and pants
        this.drawTShirt(data, resolution, centerX, shoulderY, waistY, bodyWidth);
        this.drawPants(data, resolution, centerX, waistY, hipY, bodyWidth);
        break;
      case 1: // Dress/formal
        this.drawDress(data, resolution, centerX, shoulderY, hipY, bodyWidth);
        break;
      case 2: // Casual/jacket
        this.drawJacket(data, resolution, centerX, shoulderY, waistY, bodyWidth);
        this.drawPants(data, resolution, centerX, waistY, hipY, bodyWidth);
        break;
    }
  }

  /**
   * Draw T-shirt
   */
  private static drawTShirt(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    waistY: number, 
    bodyWidth: number
  ): void {
    const necklineY = shoulderY + (waistY - shoulderY) * 0.1;
    const neckWidth = bodyWidth * 0.3;
    
    // Neckline
    for (let x = centerX - neckWidth / 2; x <= centerX + neckWidth / 2; x++) {
      this.setPixel(data, resolution, x, necklineY, 120);
    }
    
    // Hem
    for (let x = centerX - bodyWidth * 0.35; x <= centerX + bodyWidth * 0.35; x++) {
      this.setPixel(data, resolution, x, waistY, 120);
    }
  }

  /**
   * Draw pants
   */
  private static drawPants(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    waistY: number, 
    hipY: number, 
    bodyWidth: number
  ): void {
    // Waistband
    for (let x = centerX - bodyWidth * 0.35; x <= centerX + bodyWidth * 0.35; x++) {
      this.setPixel(data, resolution, x, waistY, 100);
    }
    
    // Belt line (slightly below waist)
    const beltY = waistY + (hipY - waistY) * 0.2;
    for (let x = centerX - bodyWidth * 0.3; x <= centerX + bodyWidth * 0.3; x++) {
      this.setPixel(data, resolution, x, beltY, 90);
    }
  }

  /**
   * Draw dress
   */
  private static drawDress(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    hipY: number, 
    bodyWidth: number
  ): void {
    const dressLength = hipY - shoulderY;
    const hemY = hipY + dressLength * 0.3;
    
    // Dress outline (A-line shape)
    const topWidth = bodyWidth * 0.8;
    const bottomWidth = bodyWidth * 1.2;
    
    for (let y = shoulderY; y <= hemY; y++) {
      const t = (y - shoulderY) / (hemY - shoulderY);
      const currentWidth = topWidth + (bottomWidth - topWidth) * t;
      
      this.setPixel(data, resolution, centerX - currentWidth / 2, y, 110);
      this.setPixel(data, resolution, centerX + currentWidth / 2, y, 110);
    }
    
    // Hem line
    for (let x = centerX - bottomWidth / 2; x <= centerX + bottomWidth / 2; x++) {
      this.setPixel(data, resolution, x, hemY, 110);
    }
  }

  /**
   * Draw jacket
   */
  private static drawJacket(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    shoulderY: number, 
    waistY: number, 
    bodyWidth: number
  ): void {
    // Lapels
    const lapelWidth = bodyWidth * 0.15;
    const lapelY = shoulderY + (waistY - shoulderY) * 0.3;
    
    this.drawLine(data, resolution, centerX - lapelWidth, shoulderY, centerX - lapelWidth / 2, lapelY, 100);
    this.drawLine(data, resolution, centerX + lapelWidth, shoulderY, centerX + lapelWidth / 2, lapelY, 100);
    
    // Buttons
    const buttonSpacing = (waistY - shoulderY) / 4;
    for (let i = 1; i <= 3; i++) {
      const buttonY = shoulderY + buttonSpacing * i;
      this.drawThickPoint(data, resolution, centerX, buttonY, 1, 80);
    }
  }

  /**
   * Draw foot
   */
  private static drawFoot(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    ankleX: number, 
    ankleY: number, 
    size: number
  ): void {
    // Simple oval foot
    for (let angle = 0; angle < Math.PI; angle += 0.1) {
      const x = Math.round(ankleX + Math.cos(angle) * size);
      const y = Math.round(ankleY + Math.sin(angle) * size * 0.4);
      this.setPixel(data, resolution, x, y, 70);
    }
  }

  /**
   * Helper function to draw a line between two points
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
    
    let currentX = x1;
    let currentY = y1;
    
    while (true) {
      this.setPixel(data, resolution, currentX, currentY, value);
      
      if (currentX === x2 && currentY === y2) break;
      
      const e2 = 2 * err;
      if (e2 > -dy) {
        err -= dy;
        currentX += sx;
      }
      if (e2 < dx) {
        err += dx;
        currentY += sy;
      }
    }
  }

  /**
   * Helper function to draw thick points
   */
  private static drawThickPoint(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    x: number, 
    y: number, 
    radius: number, 
    value: number
  ): void {
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        if (dx * dx + dy * dy <= radius * radius) {
          this.setPixel(data, resolution, x + dx, y + dy, value);
        }
      }
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
    value: number = 0
  ): void {
    const pixelX = Math.round(x);
    const pixelY = Math.round(y);
    
    if (pixelX >= 0 && pixelX < resolution.width && pixelY >= 0 && pixelY < resolution.height) {
      const index = (pixelY * resolution.width + pixelX) * 4;
      data[index] = value;     // R
      data[index + 1] = value; // G
      data[index + 2] = value; // B
      data[index + 3] = 255;   // A
    }
  }
}
