export class DatamoshPattern {
  /**
   * Generates sophisticated datamosh glitch effects with various artifacts
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Generate base complex pattern
    this.generateBasePattern(data, width, height);
    
    // Apply various datamosh effects
    const effectType = Math.floor(Math.random() * 5);
    
    switch (effectType) {
      case 0:
        this.applyMacroblockShift(data, width, height);
        break;
      case 1:
        this.applyPFrameCorruption(data, width, height);
        break;
      case 2:
        this.applyMotionVectorGlitch(data, width, height);
        break;
      case 3:
        this.applyCompressionArtifacts(data, width, height);
        break;
      case 4:
        this.applyCombinedDatamosh(data, width, height);
        break;
    }
    
    // Add digital noise
    this.addDigitalNoise(data, width, height);
  }

  /**
   * Generate complex base pattern resembling video content
   */
  private static generateBasePattern(data: Uint8ClampedArray, width: number, height: number): void {
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        // Create pseudo-video pattern with geometric shapes and gradients
        const centerX = width / 2;
        const centerY = height / 2;
        const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
        const angle = Math.atan2(y - centerY, x - centerX);
        
        // Multiple pattern layers
        const pattern1 = Math.sin(x * 0.02 + y * 0.015) * 127 + 128;
        const pattern2 = Math.cos(distance * 0.01 + angle * 3) * 60 + 128;
        const pattern3 = Math.sin(x * 0.005) * Math.cos(y * 0.007) * 80 + 128;
        
        // Combine patterns
        const baseR = (pattern1 * 0.4 + pattern2 * 0.3 + pattern3 * 0.3);
        const baseG = (pattern2 * 0.5 + pattern1 * 0.3 + pattern3 * 0.2);
        const baseB = (pattern3 * 0.6 + pattern1 * 0.2 + pattern2 * 0.2);
        
        data[index] = Math.max(0, Math.min(255, baseR));
        data[index + 1] = Math.max(0, Math.min(255, baseG));
        data[index + 2] = Math.max(0, Math.min(255, baseB));
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Macroblock shifting - simulate P-frame compression errors
   */
  private static applyMacroblockShift(data: Uint8ClampedArray, width: number, height: number): void {
    const blockSize = 8 + Math.floor(Math.random() * 8); // 8x8 to 16x16 macroblocks
    const corruptionRate = 0.1 + Math.random() * 0.3;
    
    for (let blockY = 0; blockY < height; blockY += blockSize) {
      for (let blockX = 0; blockX < width; blockX += blockSize) {
        if (Math.random() < corruptionRate) {
          // Random displacement vector
          const displaceX = Math.floor((Math.random() - 0.5) * width * 0.3);
          const displaceY = Math.floor((Math.random() - 0.5) * height * 0.1);
          
          // Copy block from displaced location
          for (let y = 0; y < blockSize && blockY + y < height; y++) {
            for (let x = 0; x < blockSize && blockX + x < width; x++) {
              const sourceX = Math.max(0, Math.min(width - 1, blockX + x + displaceX));
              const sourceY = Math.max(0, Math.min(height - 1, blockY + y + displaceY));
              
              const sourceIndex = (sourceY * width + sourceX) * 4;
              const targetIndex = ((blockY + y) * width + (blockX + x)) * 4;
              
              // Copy with some degradation
              data[targetIndex] = Math.max(0, Math.min(255, data[sourceIndex] + (Math.random() - 0.5) * 30));
              data[targetIndex + 1] = Math.max(0, Math.min(255, data[sourceIndex + 1] + (Math.random() - 0.5) * 20));
              data[targetIndex + 2] = Math.max(0, Math.min(255, data[sourceIndex + 2] + (Math.random() - 0.5) * 25));
            }
          }
        }
      }
    }
  }

  /**
   * P-frame corruption - simulate temporal prediction errors
   */
  private static applyPFrameCorruption(data: Uint8ClampedArray, width: number, height: number): void {
    const corruptionStrips = 5 + Math.floor(Math.random() * 15);
    
    for (let strip = 0; strip < corruptionStrips; strip++) {
      const stripY = Math.floor(Math.random() * height);
      const stripHeight = 2 + Math.floor(Math.random() * 20);
      const horizontalShift = Math.floor((Math.random() - 0.5) * width * 0.5);
      
      for (let y = stripY; y < Math.min(height, stripY + stripHeight); y++) {
        for (let x = 0; x < width; x++) {
          const sourceX = Math.max(0, Math.min(width - 1, x + horizontalShift));
          const sourceIndex = (y * width + sourceX) * 4;
          const targetIndex = (y * width + x) * 4;
          
          // Create temporal ghosting effect
          const ghosting = 0.3 + Math.random() * 0.4;
          data[targetIndex] = Math.max(0, Math.min(255, 
            data[targetIndex] * (1 - ghosting) + data[sourceIndex] * ghosting));
          data[targetIndex + 1] = Math.max(0, Math.min(255, 
            data[targetIndex + 1] * (1 - ghosting) + data[sourceIndex + 1] * ghosting));
          data[targetIndex + 2] = Math.max(0, Math.min(255, 
            data[targetIndex + 2] * (1 - ghosting) + data[sourceIndex + 2] * ghosting));
        }
      }
    }
  }

  /**
   * Motion vector glitches
   */
  private static applyMotionVectorGlitch(data: Uint8ClampedArray, width: number, height: number): void {
    const numVectors = 20 + Math.floor(Math.random() * 40);
    
    for (let vector = 0; vector < numVectors; vector++) {
      const centerX = Math.floor(Math.random() * width);
      const centerY = Math.floor(Math.random() * height);
      const radius = 10 + Math.floor(Math.random() * 50);
      const motionX = (Math.random() - 0.5) * 100;
      const motionY = (Math.random() - 0.5) * 30;
      
      for (let y = centerY - radius; y < centerY + radius && y < height; y++) {
        for (let x = centerX - radius; x < centerX + radius && x < width; x++) {
          if (x >= 0 && y >= 0) {
            const distance = Math.sqrt((x - centerX) ** 2 + (y - centerY) ** 2);
            if (distance < radius) {
              const sourceX = Math.max(0, Math.min(width - 1, Math.floor(x + motionX * (1 - distance / radius))));
              const sourceY = Math.max(0, Math.min(height - 1, Math.floor(y + motionY * (1 - distance / radius))));
              
              const sourceIndex = (sourceY * width + sourceX) * 4;
              const targetIndex = (y * width + x) * 4;
              
              const blend = 0.5 + Math.random() * 0.3;
              data[targetIndex] = Math.max(0, Math.min(255, 
                data[targetIndex] * (1 - blend) + data[sourceIndex] * blend));
              data[targetIndex + 1] = Math.max(0, Math.min(255, 
                data[targetIndex + 1] * (1 - blend) + data[sourceIndex + 1] * blend));
              data[targetIndex + 2] = Math.max(0, Math.min(255, 
                data[targetIndex + 2] * (1 - blend) + data[sourceIndex + 2] * blend));
            }
          }
        }
      }
    }
  }

  /**
   * Compression artifacts and DCT errors
   */
  private static applyCompressionArtifacts(data: Uint8ClampedArray, width: number, height: number): void {
    const blockSize = 8; // DCT block size
    
    for (let blockY = 0; blockY < height; blockY += blockSize) {
      for (let blockX = 0; blockX < width; blockX += blockSize) {
        if (Math.random() < 0.2) { // 20% chance of block corruption
          // Simulate DCT quantization errors
          for (let y = 0; y < blockSize && blockY + y < height; y++) {
            for (let x = 0; x < blockSize && blockX + x < width; x++) {
              const index = ((blockY + y) * width + (blockX + x)) * 4;
              
              // Apply harsh quantization
              const quantizationLevel = 32 + Math.floor(Math.random() * 64);
              data[index] = Math.floor(data[index] / quantizationLevel) * quantizationLevel;
              data[index + 1] = Math.floor(data[index + 1] / quantizationLevel) * quantizationLevel;
              data[index + 2] = Math.floor(data[index + 2] / quantizationLevel) * quantizationLevel;
              
              // Add blocking artifacts
              if (x === 0 || y === 0) {
                data[index] = Math.max(0, Math.min(255, data[index] + (Math.random() - 0.5) * 50));
                data[index + 1] = Math.max(0, Math.min(255, data[index + 1] + (Math.random() - 0.5) * 50));
                data[index + 2] = Math.max(0, Math.min(255, data[index + 2] + (Math.random() - 0.5) * 50));
              }
            }
          }
        }
      }
    }
  }

  /**
   * Combined datamosh effects
   */
  private static applyCombinedDatamosh(data: Uint8ClampedArray, width: number, height: number): void {
    // Apply multiple effects with reduced intensity
    this.applyMacroblockShift(data, width, height);
    
    // Reduce intensity for second pass
    for (let i = 0; i < data.length; i += 4) {
      const backup = [data[i], data[i + 1], data[i + 2]];
      
      // Apply P-frame corruption with reduced effect
      if (Math.random() < 0.3) {
        this.applyMotionVectorGlitch(data, width, height);
      }
      
      // Blend with original
      const blendRatio = 0.7;
      data[i] = backup[0] * blendRatio + data[i] * (1 - blendRatio);
      data[i + 1] = backup[1] * blendRatio + data[i + 1] * (1 - blendRatio);
      data[i + 2] = backup[2] * blendRatio + data[i + 2] * (1 - blendRatio);
    }
  }

  /**
   * Add digital noise and compression artifacts
   */
  private static addDigitalNoise(data: Uint8ClampedArray, _width: number, _height: number): void {
    for (let i = 0; i < data.length; i += 4) {
      if (Math.random() < 0.05) { // 5% chance of noise per pixel
        const noiseIntensity = (Math.random() - 0.5) * 40;
        data[i] = Math.max(0, Math.min(255, data[i] + noiseIntensity));
        data[i + 1] = Math.max(0, Math.min(255, data[i + 1] + noiseIntensity));
        data[i + 2] = Math.max(0, Math.min(255, data[i + 2] + noiseIntensity));
      }
    }
    
    // Add occasional bit errors
    const bitErrors = Math.floor(Math.random() * 20);
    for (let error = 0; error < bitErrors; error++) {
      const randomIndex = Math.floor(Math.random() * data.length / 4) * 4;
      const channel = Math.floor(Math.random() * 3);
      
      // Flip some bits
      data[randomIndex + channel] ^= (1 << Math.floor(Math.random() * 8));
      data[randomIndex + channel] = Math.max(0, Math.min(255, data[randomIndex + channel]));
    }
  }
}
