import type { Resolution } from '../../imageGenerator';

export class WavePattern {
  /**
   * Generates sophisticated wave interference patterns with multiple wave types
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const patternType = Math.floor(Math.random() * 6);
    
    switch (patternType) {
      case 0:
        this.generateRadialWaves(data, resolution);
        break;
      case 1:
        this.generateLinearWaves(data, resolution);
        break;
      case 2:
        this.generateStandingWaves(data, resolution);
        break;
      case 3:
        this.generateInterferencePattern(data, resolution);
        break;
      case 4:
        this.generateModulatedWaves(data, resolution);
        break;
      case 5:
        this.generateRipplePattern(data, resolution);
        break;
    }
  }

  /**
   * Radial waves emanating from multiple points
   */
  private static generateRadialWaves(data: Uint8ClampedArray, resolution: Resolution): void {
    const numSources = 2 + Math.floor(Math.random() * 4);
    const sources: { x: number; y: number; frequency: number; amplitude: number; phase: number }[] = [];
    
    for (let i = 0; i < numSources; i++) {
      sources.push({
        x: Math.random() * resolution.width,
        y: Math.random() * resolution.height,
        frequency: 0.008 + Math.random() * 0.02,
        amplitude: 0.3 + Math.random() * 0.7,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let sum = 0;
        for (const source of sources) {
          const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2);
          const wave = Math.sin(distance * source.frequency + source.phase) * source.amplitude;
          sum += wave / (1 + distance * 0.001); // Attenuation with distance
        }
        
        const value = sum > 0 ? 255 : 0;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Linear wave patterns at various angles
   */
  private static generateLinearWaves(data: Uint8ClampedArray, resolution: Resolution): void {
    const numWaves = 2 + Math.floor(Math.random() * 4);
    const waves: { angle: number; frequency: number; amplitude: number; phase: number }[] = [];
    
    for (let i = 0; i < numWaves; i++) {
      waves.push({
        angle: Math.random() * Math.PI * 2,
        frequency: 0.01 + Math.random() * 0.03,
        amplitude: 0.4 + Math.random() * 0.6,
        phase: Math.random() * Math.PI * 2
      });
    }
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let sum = 0;
        for (const wave of waves) {
          const distance = x * Math.cos(wave.angle) + y * Math.sin(wave.angle);
          sum += Math.sin(distance * wave.frequency + wave.phase) * wave.amplitude;
        }
        
        const value = sum > 0 ? 255 : 0;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Standing wave patterns
   */
  private static generateStandingWaves(data: Uint8ClampedArray, resolution: Resolution): void {
    const freqX = 0.01 + Math.random() * 0.02;
    const freqY = 0.01 + Math.random() * 0.02;
    const phaseX = Math.random() * Math.PI * 2;
    const phaseY = Math.random() * Math.PI * 2;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        const waveX = Math.sin(x * freqX + phaseX);
        const waveY = Math.sin(y * freqY + phaseY);
        const standing = waveX * waveY;
        
        const value = standing > 0 ? 255 : 0;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Complex interference patterns
   */
  private static generateInterferencePattern(data: Uint8ClampedArray, resolution: Resolution): void {
    const sources = [
      { x: resolution.width * 0.2, y: resolution.height * 0.3, freq: 0.015, amp: 1 },
      { x: resolution.width * 0.8, y: resolution.height * 0.3, freq: 0.015, amp: 1 },
      { x: resolution.width * 0.5, y: resolution.height * 0.7, freq: 0.02, amp: 0.8 }
    ];
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let sum = 0;
        for (const source of sources) {
          const distance = Math.sqrt((x - source.x) ** 2 + (y - source.y) ** 2);
          sum += Math.sin(distance * source.freq) * source.amp / (1 + distance * 0.0005);
        }
        
        const value = sum > 0 ? 255 : 0;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Amplitude and frequency modulated waves
   */
  private static generateModulatedWaves(data: Uint8ClampedArray, resolution: Resolution): void {
    const carrierFreq = 0.02 + Math.random() * 0.03;
    const modFreq = 0.003 + Math.random() * 0.007;
    const modDepth = 0.5 + Math.random() * 0.5;
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        const distance = Math.sqrt((x - resolution.width/2) ** 2 + (y - resolution.height/2) ** 2);
        const modulator = 1 + modDepth * Math.sin(distance * modFreq);
        const carrier = Math.sin(distance * carrierFreq * modulator);
        
        const value = carrier > 0 ? 255 : 0;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }

  /**
   * Water ripple effects
   */
  private static generateRipplePattern(data: Uint8ClampedArray, resolution: Resolution): void {
    const dropCount = 3 + Math.floor(Math.random() * 5);
    const drops: { x: number; y: number; time: number; strength: number }[] = [];
    
    for (let i = 0; i < dropCount; i++) {
      drops.push({
        x: Math.random() * resolution.width,
        y: Math.random() * resolution.height,
        time: Math.random() * 100,
        strength: 0.5 + Math.random() * 0.5
      });
    }
    
    for (let y = 0; y < resolution.height; y++) {
      for (let x = 0; x < resolution.width; x++) {
        const index = (y * resolution.width + x) * 4;
        
        let sum = 0;
        for (const drop of drops) {
          const distance = Math.sqrt((x - drop.x) ** 2 + (y - drop.y) ** 2);
          const wave = Math.sin(distance * 0.03 - drop.time) * drop.strength;
          const dampening = Math.exp(-distance * 0.002);
          sum += wave * dampening;
        }
        
        const value = sum > 0 ? 255 : 0;
        data[index] = value;
        data[index + 1] = value;
        data[index + 2] = value;
        data[index + 3] = 255;
      }
    }
  }
}
