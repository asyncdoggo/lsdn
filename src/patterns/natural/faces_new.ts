import type { Resolution } from '../../imageGenerator';

export class FacesPattern {
  /**
   * Generates a single detailed realistic face with proper proportions and shading
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Initialize to light background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 250;
      data[i + 1] = 248;
      data[i + 2] = 245;
      data[i + 3] = 255;
    }

    // Center the face in the canvas with appropriate size
    const faceWidth = Math.min(resolution.width, resolution.height) * 0.6;
    const faceHeight = faceWidth * 1.3; // Realistic face proportions
    const faceX = resolution.width / 2;
    const faceY = resolution.height / 2;
    
    // Choose a random face style
    const faceStyle = Math.floor(Math.random() * 3);
    
    // Draw the complete face
    this.drawDetailedFace(data, resolution, faceX, faceY, faceWidth, faceHeight, faceStyle);
  }

  /**
   * Draw a complete detailed face with all features
   */
  private static drawDetailedFace(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number,
    style: number
  ): void {
    // Face outline with realistic shape
    this.drawFaceOutline(data, resolution, centerX, centerY, width, height);
    
    // Facial features with proper proportions
    const eyeY = centerY - height * 0.15;
    const eyeSpacing = width * 0.18;
    const eyeWidth = width * 0.08;
    const eyeHeight = eyeWidth * 0.7;
    
    // Eyes
    this.drawDetailedEye(data, resolution, centerX - eyeSpacing, eyeY, eyeWidth, eyeHeight, false);
    this.drawDetailedEye(data, resolution, centerX + eyeSpacing, eyeY, eyeWidth, eyeHeight, true);
    
    // Eyebrows
    this.drawDetailedEyebrow(data, resolution, centerX - eyeSpacing, eyeY - eyeHeight * 1.5, eyeWidth * 1.2, false);
    this.drawDetailedEyebrow(data, resolution, centerX + eyeSpacing, eyeY - eyeHeight * 1.5, eyeWidth * 1.2, true);
    
    // Nose with detailed structure
    const noseY = centerY + height * 0.02;
    const noseWidth = width * 0.06;
    const noseHeight = height * 0.12;
    this.drawDetailedNose(data, resolution, centerX, noseY, noseWidth, noseHeight);
    
    // Mouth with expression variation based on style
    const mouthY = centerY + height * 0.22;
    const mouthWidth = width * 0.12;
    this.drawDetailedMouth(data, resolution, centerX, mouthY, mouthWidth, style);
    
    // Hair based on style
    this.drawDetailedHair(data, resolution, centerX, centerY, width, height, style);
    
    // Add facial contours and shading
    this.addFacialShading(data, resolution, centerX, centerY, width, height);
    
    // Optional accessories based on style
    if (style === 2) {
      this.drawGlasses(data, resolution, centerX, eyeY, eyeSpacing, eyeWidth);
    }
  }

  /**
   * Draw realistic face outline with proper curves
   */
  private static drawFaceOutline(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number
  ): void {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Draw face outline using parametric equations for realistic shape
    for (let angle = 0; angle < Math.PI * 2; angle += 0.01) {
      // Modify radius based on angle for realistic face shape
      let radiusX = halfWidth;
      let radiusY = halfHeight;
      
      // Narrower at chin and temples
      if (angle > Math.PI * 0.3 && angle < Math.PI * 0.7) {
        // Forehead area - slightly wider
        radiusX *= 0.95;
        radiusY *= 0.98;
      } else if (angle > Math.PI * 1.2 && angle < Math.PI * 1.8) {
        // Chin area - narrower
        radiusX *= 0.7;
        radiusY *= 0.95;
      } else if (angle > Math.PI * 0.8 && angle < Math.PI * 1.2) {
        // Cheek area
        radiusX *= 0.9;
      }
      
      const x = Math.round(centerX + Math.cos(angle) * radiusX);
      const y = Math.round(centerY + Math.sin(angle) * radiusY);
      
      // Draw thick outline
      this.drawThickPoint(data, resolution, x, y, 2, 80);
    }
  }

  /**
   * Draw detailed eye with iris, pupil, and eyelids
   */
  private static drawDetailedEye(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number,
    isRight: boolean
  ): void {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Eye outline (almond shape)
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const radiusX = halfWidth * (1 + 0.3 * Math.cos(angle * 2));
      const radiusY = halfHeight;
      
      const x = Math.round(centerX + Math.cos(angle) * radiusX);
      const y = Math.round(centerY + Math.sin(angle) * radiusY);
      
      this.setPixel(data, resolution, x, y, 50);
    }
    
    // Iris (larger circle)
    const irisRadius = Math.min(halfWidth, halfHeight) * 0.8;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const x = Math.round(centerX + Math.cos(angle) * irisRadius);
      const y = Math.round(centerY + Math.sin(angle) * irisRadius);
      this.setPixel(data, resolution, x, y, 120);
    }
    
    // Pupil (smaller circle)
    const pupilRadius = irisRadius * 0.4;
    for (let angle = 0; angle < Math.PI * 2; angle += 0.1) {
      for (let r = 0; r < pupilRadius; r++) {
        const x = Math.round(centerX + Math.cos(angle) * r);
        const y = Math.round(centerY + Math.sin(angle) * r);
        this.setPixel(data, resolution, x, y, 20);
      }
    }
    
    // Highlight in eye
    const highlightX = centerX + (isRight ? -irisRadius * 0.3 : irisRadius * 0.3);
    const highlightY = centerY - irisRadius * 0.2;
    this.drawThickPoint(data, resolution, highlightX, highlightY, 2, 200);
  }

  /**
   * Draw detailed eyebrow with hair-like strokes
   */
  private static drawDetailedEyebrow(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number,
    isRight: boolean
  ): void {
    const numHairs = 15 + Math.floor(Math.random() * 10);
    
    for (let hair = 0; hair < numHairs; hair++) {
      const t = hair / (numHairs - 1);
      const x = centerX + (t - 0.5) * width;
      const y = centerY + Math.sin(t * Math.PI) * width * 0.1 * (isRight ? 1 : -1);
      
      // Draw individual hair strokes
      const hairLength = 5 + Math.random() * 8;
      const hairAngle = (isRight ? -0.3 : 0.3) + (Math.random() - 0.5) * 0.4;
      
      for (let len = 0; len < hairLength; len++) {
        const hairX = Math.round(x + Math.cos(hairAngle + Math.PI/2) * len);
        const hairY = Math.round(y + Math.sin(hairAngle + Math.PI/2) * len);
        this.setPixel(data, resolution, hairX, hairY, 60);
      }
    }
  }

  /**
   * Draw detailed nose with nostrils and bridge
   */
  private static drawDetailedNose(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number, 
    height: number
  ): void {
    const halfWidth = width / 2;
    const halfHeight = height / 2;
    
    // Nose bridge (vertical line with curves)
    for (let y = centerY - halfHeight; y < centerY + halfHeight * 0.7; y++) {
      const curveOffset = Math.sin((y - centerY + halfHeight) / height * Math.PI) * halfWidth * 0.3;
      this.setPixel(data, resolution, centerX + curveOffset, y, 90);
    }
    
    // Nostrils
    const nostrilY = centerY + halfHeight * 0.6;
    const nostrilSpacing = halfWidth * 0.8;
    
    // Left nostril
    for (let angle = 0; angle < Math.PI; angle += 0.1) {
      const x = Math.round(centerX - nostrilSpacing + Math.cos(angle) * halfWidth * 0.3);
      const y = Math.round(nostrilY + Math.sin(angle) * halfWidth * 0.2);
      this.setPixel(data, resolution, x, y, 70);
    }
    
    // Right nostril
    for (let angle = 0; angle < Math.PI; angle += 0.1) {
      const x = Math.round(centerX + nostrilSpacing + Math.cos(angle) * halfWidth * 0.3);
      const y = Math.round(nostrilY + Math.sin(angle) * halfWidth * 0.2);
      this.setPixel(data, resolution, x, y, 70);
    }
    
    // Nose tip
    this.drawThickPoint(data, resolution, centerX, nostrilY - halfWidth * 0.3, 2, 100);
  }

  /**
   * Draw detailed mouth with different expressions
   */
  private static drawDetailedMouth(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    width: number,
    style: number
  ): void {
    const halfWidth = width / 2;
    
    // Different mouth shapes based on style
    let mouthCurve = 0;
    switch (style) {
      case 0: // Neutral
        mouthCurve = 0;
        break;
      case 1: // Slight smile
        mouthCurve = -halfWidth * 0.2;
        break;
      case 2: // Serious/focused
        mouthCurve = halfWidth * 0.1;
        break;
    }
    
    // Upper lip
    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
      const t = (x - centerX + halfWidth) / width;
      const y = centerY - Math.sin(t * Math.PI) * halfWidth * 0.1 + mouthCurve * Math.sin(t * Math.PI);
      this.setPixel(data, resolution, x, Math.round(y), 60);
    }
    
    // Lower lip
    for (let x = centerX - halfWidth; x <= centerX + halfWidth; x++) {
      const t = (x - centerX + halfWidth) / width;
      const y = centerY + Math.sin(t * Math.PI) * halfWidth * 0.15 + mouthCurve * Math.sin(t * Math.PI) * 0.5;
      this.setPixel(data, resolution, x, Math.round(y), 60);
    }
    
    // Corner details
    this.drawThickPoint(data, resolution, centerX - halfWidth, centerY, 1, 80);
    this.drawThickPoint(data, resolution, centerX + halfWidth, centerY, 1, 80);
  }

  /**
   * Draw hair based on style
   */
  private static drawDetailedHair(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    faceWidth: number, 
    faceHeight: number,
    style: number
  ): void {
    const hairColor = 40 + Math.floor(Math.random() * 60);
    
    switch (style) {
      case 0: // Short hair
        this.drawShortHair(data, resolution, centerX, centerY, faceWidth, faceHeight, hairColor);
        break;
      case 1: // Long hair
        this.drawLongHair(data, resolution, centerX, centerY, faceWidth, faceHeight, hairColor);
        break;
      case 2: // Curly/wavy hair
        this.drawCurlyHair(data, resolution, centerX, centerY, faceWidth, faceHeight, hairColor);
        break;
    }
  }

  /**
   * Draw short hair style
   */
  private static drawShortHair(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    faceWidth: number, 
    faceHeight: number,
    hairColor: number
  ): void {
    const hairRadius = faceWidth * 0.6;
    
    for (let angle = -Math.PI * 0.8; angle < Math.PI * 0.2; angle += 0.05) {
      const x = Math.round(centerX + Math.cos(angle) * hairRadius);
      const y = Math.round(centerY + Math.sin(angle) * hairRadius - faceHeight * 0.1);
      
      // Create hair texture with random strokes
      for (let stroke = 0; stroke < 5; stroke++) {
        const strokeX = x + (Math.random() - 0.5) * 10;
        const strokeY = y + (Math.random() - 0.5) * 10;
        this.setPixel(data, resolution, strokeX, strokeY, hairColor);
      }
    }
  }

  /**
   * Draw long hair style
   */
  private static drawLongHair(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    faceWidth: number, 
    faceHeight: number,
    hairColor: number
  ): void {
    // Hair strands flowing down
    const numStrands = 20;
    
    for (let strand = 0; strand < numStrands; strand++) {
      const startAngle = -Math.PI * 0.7 + (strand / numStrands) * Math.PI * 1.4;
      const startX = centerX + Math.cos(startAngle) * faceWidth * 0.5;
      const startY = centerY + Math.sin(startAngle) * faceHeight * 0.3;
      
      // Draw flowing hair strand
      const strandLength = 50 + Math.random() * 100;
      let currentX = startX;
      let currentY = startY;
      
      for (let len = 0; len < strandLength; len++) {
        currentY += 1 + Math.random() * 0.5;
        currentX += (Math.random() - 0.5) * 2; // Natural sway
        
        this.setPixel(data, resolution, currentX, currentY, hairColor);
      }
    }
  }

  /**
   * Draw curly/wavy hair style
   */
  private static drawCurlyHair(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    faceWidth: number, 
    faceHeight: number,
    hairColor: number
  ): void {
    const numCurls = 15;
    
    for (let curl = 0; curl < numCurls; curl++) {
      const curlAngle = -Math.PI * 0.8 + (curl / numCurls) * Math.PI * 1.6;
      const curlCenterX = centerX + Math.cos(curlAngle) * faceWidth * 0.4;
      const curlCenterY = centerY + Math.sin(curlAngle) * faceHeight * 0.2;
      
      // Draw spiral curls
      for (let spiralAngle = 0; spiralAngle < Math.PI * 4; spiralAngle += 0.1) {
        const radius = 5 + spiralAngle * 2;
        const x = curlCenterX + Math.cos(spiralAngle) * radius;
        const y = curlCenterY + Math.sin(spiralAngle) * radius * 0.5;
        
        this.setPixel(data, resolution, x, y, hairColor);
      }
    }
  }

  /**
   * Add facial shading and contours
   */
  private static addFacialShading(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    faceWidth: number, 
    faceHeight: number
  ): void {
    // Add subtle cheek contours
    const cheekRadius = faceWidth * 0.15;
    
    // Left cheek
    this.addSoftShading(data, resolution, centerX - faceWidth * 0.2, centerY + faceHeight * 0.1, cheekRadius, 220);
    
    // Right cheek
    this.addSoftShading(data, resolution, centerX + faceWidth * 0.2, centerY + faceHeight * 0.1, cheekRadius, 220);
    
    // Jaw line shadow
    for (let x = centerX - faceWidth * 0.3; x < centerX + faceWidth * 0.3; x++) {
      const y = centerY + faceHeight * 0.4;
      this.setPixel(data, resolution, x, y, 200);
    }
  }

  /**
   * Draw glasses accessory
   */
  private static drawGlasses(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    eyeY: number, 
    eyeSpacing: number, 
    eyeWidth: number
  ): void {
    const lensRadius = eyeWidth * 0.8;
    
    // Left lens
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const x = Math.round(centerX - eyeSpacing + Math.cos(angle) * lensRadius);
      const y = Math.round(eyeY + Math.sin(angle) * lensRadius);
      this.setPixel(data, resolution, x, y, 30);
    }
    
    // Right lens
    for (let angle = 0; angle < Math.PI * 2; angle += 0.05) {
      const x = Math.round(centerX + eyeSpacing + Math.cos(angle) * lensRadius);
      const y = Math.round(eyeY + Math.sin(angle) * lensRadius);
      this.setPixel(data, resolution, x, y, 30);
    }
    
    // Bridge
    for (let x = centerX - eyeSpacing + lensRadius; x < centerX + eyeSpacing - lensRadius; x++) {
      this.setPixel(data, resolution, x, eyeY, 30);
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
   * Helper function to add soft shading
   */
  private static addSoftShading(
    data: Uint8ClampedArray, 
    resolution: Resolution, 
    centerX: number, 
    centerY: number, 
    radius: number, 
    maxValue: number
  ): void {
    for (let y = centerY - radius; y <= centerY + radius; y++) {
      for (let x = centerX - radius; x <= centerX + radius; x++) {
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        if (distance <= radius) {
          const intensity = (1 - distance / radius) * maxValue;
          this.setPixel(data, resolution, x, y, Math.max(intensity, 0));
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
