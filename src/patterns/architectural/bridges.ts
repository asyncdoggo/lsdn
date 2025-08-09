export class BridgesPattern {
  /**
   * Generates bridge architectural patterns with spans and supports
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with sky background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 180;     // R
      data[i + 1] = 200; // G
      data[i + 2] = 220; // B
      data[i + 3] = 255; // A
    }
    
    // Bridge deck position
    const bridgeY = height * 0.6;
    const bridgeHeight = 20;
    
    // Draw main bridge deck
    for (let y = bridgeY; y < bridgeY + bridgeHeight; y++) {
      for (let x = 0; x < width; x++) {
        if (y >= 0 && y < height) {
          const index = (Math.floor(y) * width + x) * 4;
          data[index] = 100;     // R
          data[index + 1] = 100; // G
          data[index + 2] = 100; // B
        }
      }
    }
    
    // Bridge supports/pillars
    const supportCount = 3 + Math.floor(Math.random() * 3);
    const supportSpacing = width / (supportCount + 1);
    const supportWidth = 15;
    
    for (let support = 0; support < supportCount; support++) {
      const supportX = (support + 1) * supportSpacing - supportWidth / 2;
      
      // Draw support pillar
      for (let y = bridgeY + bridgeHeight; y < height; y++) {
        for (let x = supportX; x < supportX + supportWidth; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            data[index] = 80;     // R
            data[index + 1] = 80; // G
            data[index + 2] = 80; // B
          }
        }
      }
    }
    
    // Cable-stayed bridge cables (if applicable)
    if (Math.random() > 0.5) {
      const towerX = width / 2;
      const towerHeight = height * 0.4;
      const towerWidth = 12;
      
      // Draw tower
      for (let y = bridgeY - towerHeight; y < bridgeY + bridgeHeight; y++) {
        for (let x = towerX - towerWidth / 2; x < towerX + towerWidth / 2; x++) {
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (Math.floor(y) * width + Math.floor(x)) * 4;
            data[index] = 60;     // R
            data[index + 1] = 60; // G
            data[index + 2] = 60; // B
          }
        }
      }
      
      // Draw cables
      const cableCount = 8;
      for (let cable = 0; cable < cableCount; cable++) {
        const cableX = (cable / (cableCount - 1)) * width;
        const cableTopY = bridgeY - towerHeight * 0.8;
        
        // Simple line from tower to deck
        const steps = Math.abs(cableX - towerX);
        for (let step = 0; step < steps; step++) {
          const x = Math.floor(towerX + (cableX - towerX) * step / steps);
          const y = Math.floor(cableTopY + (bridgeY - cableTopY) * step / steps);
          
          if (x >= 0 && x < width && y >= 0 && y < height) {
            const index = (y * width + x) * 4;
            data[index] = 40;     // R
            data[index + 1] = 40; // G
            data[index + 2] = 40; // B
          }
        }
      }
    }
  }
}
