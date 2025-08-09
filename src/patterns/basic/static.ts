import type { Resolution } from '../../imageGenerator';

export class StaticPattern {
  /**
   * Generates sophisticated TV static/interference patterns with multiple effects
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const staticType = Math.floor(Math.random() * 5);
    
    switch (staticType) {
      case 0:
        this.generateClassicStatic(data, resolution);
        break;
      case 1:
        this.generateAnalogInterference(data, resolution);
        break;
      case 2:
        this.generateDigitalNoise(data, resolution);
        break;
      case 3:
        this.generateSnowStatic(data, resolution);
        break;
      case 4:
        this.generateBandedInterference(data, resolution);
        break;
    }
  }

  /**
   * Classic TV static with varying intensities
   */
  private static generateClassicStatic(data: Uint8ClampedArray, resolution: Resolution): void {
    const density = 0.3 + Math.random() * 0.4;
    const intensity = 0.6 + Math.random() * 0.4;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let value = 0;
        if (Math.random() < density) {
          const noise = Math.random();
          if (noise > 0.7) value = 255;
          else if (noise > 0.3) value = Math.floor(128 * intensity);
          else value = 0;
        }
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
    
    // Add horizontal scan lines
    this.addScanLines(data, resolution);
  }

  /**
   * Analog TV interference with rolling bars
   */
  private static generateAnalogInterference(data: Uint8ClampedArray, resolution: Resolution): void {
    // Base noise
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        const value = Math.random() > 0.8 ? (Math.random() > 0.5 ? 255 : 0) : 128;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
    
    // Add rolling interference bars
    const numBars = 3 + Math.floor(Math.random() * 5);
    for (let i = 0; i < numBars; i++) {
      const barY = Math.floor(Math.random() * resolution.height);
      const barHeight = 2 + Math.floor(Math.random() * 8);
      const barIntensity = Math.random() > 0.5 ? 255 : 0;
      
      for (let y = barY; y < Math.min(barY + barHeight, resolution.height); y++) {
      for (let x = 0; x < resolution.width; x++) {
        const distortion = Math.sin(x * 0.1 + i) * 20;
        const actualX = Math.max(0, Math.min(resolution.width - 1, x + distortion));
        const actualIndex = (y * resolution.width + Math.floor(actualX)) * 4;
        
        data[actualIndex] = barIntensity;
        data[actualIndex + 1] = barIntensity;
        data[actualIndex + 2] = barIntensity;
        }
      }
    }
  }

  /**
   * Digital compression noise and artifacts
   */
  private static generateDigitalNoise(data: Uint8ClampedArray, resolution: Resolution): void {
    const blockSize = 4 + Math.floor(Math.random() * 8);
    
    for (let y = 0; y < resolution.height; y += blockSize) {
      for (let x = 0; x < resolution.width; x += blockSize) {
        // Determine if this block is corrupted
        const isCorrupted = Math.random() < 0.3;
        let blockValue = Math.random() > 0.5 ? 255 : 0;
        
        if (isCorrupted) {
          // Create digital artifact patterns
          const artifactType = Math.floor(Math.random() * 3);
          for (let by = 0; by < blockSize && y + by < resolution.height; by++) {
            for (let bx = 0; bx < blockSize && x + bx < resolution.width; bx++) {
              const index = ((y + by) * resolution.width + (x + bx)) * 4;
              
              let value = blockValue;
              switch (artifactType) {
                case 0: // Checkerboard corruption
                  value = (bx + by) % 2 === 0 ? 255 : 0;
                  break;
                case 1: // Horizontal stripes
                  value = by % 2 === 0 ? 255 : 0;
                  break;
                case 2: // Random digital noise
                  value = Math.random() > 0.5 ? 255 : 0;
                  break;
              }
              
              data[index] = value;
              data[index + 1] = value;
              data[index + 2] = value;
              data[index + 3] = 255;
            }
          }
        } else {
          // Normal block
          for (let by = 0; by < blockSize && y + by < resolution.height; by++) {
            for (let bx = 0; bx < blockSize && x + bx < resolution.width; bx++) {
              const index = ((y + by) * resolution.width + (x + bx)) * 4;
              data[index] = blockValue;
              data[index + 1] = blockValue;
              data[index + 2] = blockValue;
              data[index + 3] = 255;
            }
          }
        }
      }
    }
  }

  /**
   * Snow static effect
   */
  private static generateSnowStatic(data: Uint8ClampedArray, resolution: Resolution): void {
    const snowDensity = 0.1 + Math.random() * 0.3;
    
    // Fill with dark background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 32;
      data[i + 1] = 32;
      data[i + 2] = 32;
      data[i + 3] = 255;
    }
    
    // Add snow particles
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        if (Math.random() < snowDensity) {
          const brightness = 200 + Math.floor(Math.random() * 55);
          
          // Create small clusters for snow effect
          const clusterSize = Math.random() > 0.7 ? 2 : 1;
          for (let cy = 0; cy < clusterSize && y + cy < resolution.height; cy++) {
            for (let cx = 0; cx < clusterSize && x + cx < resolution.width; cx++) {
              const clusterIndex = ((y + cy) * resolution.width + (x + cx)) * 4;
              data[clusterIndex] = brightness;
              data[clusterIndex + 1] = brightness;
              data[clusterIndex + 2] = brightness;
            }
          }
        }
      }
    }
  }

  /**
   * Banded interference with frequency patterns
   */
  private static generateBandedInterference(data: Uint8ClampedArray, resolution: Resolution): void {
    const bandFrequency = 0.02 + Math.random() * 0.08;
    const noiseFrequency = 0.1 + Math.random() * 0.2;
    
    for (let y = 0; y < resolution.height; y++) {
      const bandIntensity = (Math.sin(y * bandFrequency) + 1) * 0.5;
      
      for (let x = 0; x < resolution.width; x++) {
        // Base interference pattern
        const noise = Math.sin(x * noiseFrequency) * Math.sin(y * noiseFrequency * 0.7);
        const interference = (noise + 1) * 0.5 * bandIntensity;
        
        // Add random static
        const staticNoise = Math.random() * 0.3;
        const combined = Math.min(1, interference + staticNoise);
        
        const value = combined > 0.5 ? 255 : 0;
        const index = (y * resolution.width + x) * 4;
        
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Add horizontal scan lines for authentic TV effect
   */
  private static addScanLines(data: Uint8ClampedArray, resolution: Resolution): void {
    const scanLineSpacing = 3 + Math.floor(Math.random() * 5);
    const scanLineIntensity = 0.3 + Math.random() * 0.4;
    
    for (let y = 0; y < resolution.height; y += scanLineSpacing) {
      if (Math.random() < scanLineIntensity) {
        const lineIntensity = Math.random() > 0.5 ? 255 : 0;
        const lineThickness = Math.random() > 0.8 ? 2 : 1;
        
        for (let thickness = 0; thickness < lineThickness && y + thickness < resolution.height; thickness++) {
          for (let x = 0; x < resolution.width; x++) {
            if (Math.random() > 0.1) { // Don't fill entire line
              const index = ((y + thickness) * resolution.width + x) * 4;
              data[index] = lineIntensity;
              data[index + 1] = lineIntensity;
              data[index + 2] = lineIntensity;
            }
          }
        }
      }
    }
  }
}
