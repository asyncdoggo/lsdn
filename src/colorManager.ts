import type { PatternType } from './patternRegistry';
import { PatternRegistry } from './patternRegistry';

/**
 * Manages color conversion and palette application for generated patterns
 */
export class ColorManager {
  /**
   * Converts a black and white image to color using artistic color palettes
   */
  static convertToColor(imageData: ImageData, pattern: PatternType): void {
    const data = imageData.data;
    
    // Determine if this pattern benefits from multicolor treatment
    const isMulticolorPattern = PatternRegistry.isMulticolorCandidate(pattern);
    
    if (isMulticolorPattern) {
      this.applyMulticolorConversion(data, pattern);
    } else {
      this.applySinglePaletteConversion(data);
    }
  }

  /**
   * Applies sophisticated multicolor conversion for compatible patterns
   */
  private static applyMulticolorConversion(data: Uint8ClampedArray, pattern: PatternType): void {
    const category = PatternRegistry.getPatternCategory(pattern);
    const colorScheme = this.getColorSchemeForCategory(category);
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // Get grayscale value
      const intensity = gray / 255;
      
      // Map intensity to color scheme
      const colorIndex = Math.floor(intensity * (colorScheme.length - 1));
      const nextColorIndex = Math.min(colorIndex + 1, colorScheme.length - 1);
      
      // Interpolate between colors for smooth gradients
      const t = (intensity * (colorScheme.length - 1)) - colorIndex;
      
      const color1 = colorScheme[colorIndex];
      const color2 = colorScheme[nextColorIndex];
      
      const r = color1[0] + (color2[0] - color1[0]) * t;
      const g = color1[1] + (color2[1] - color1[1]) * t;
      const b = color1[2] + (color2[2] - color1[2]) * t;
      
      data[i] = Math.round(r);     // R
      data[i + 1] = Math.round(g); // G
      data[i + 2] = Math.round(b); // B
      // Alpha remains unchanged
    }
  }

  /**
   * Applies single artistic palette conversion for simple patterns
   */
  private static applySinglePaletteConversion(data: Uint8ClampedArray): void {
    const palette = this.getRandomArtisticPalette();
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // Get grayscale value (R=G=B in B&W)
      const intensity = gray / 255;
      
      let r, g, b;
      
      if (intensity < 0.3) {
        // Dark areas
        const factor = intensity / 0.3;
        r = palette.dark[0] * factor;
        g = palette.dark[1] * factor;
        b = palette.dark[2] * factor;
      } else if (intensity < 0.7) {
        // Mid tones
        const factor = (intensity - 0.3) / 0.4;
        r = palette.dark[0] + (palette.mid[0] - palette.dark[0]) * factor;
        g = palette.dark[1] + (palette.mid[1] - palette.dark[1]) * factor;
        b = palette.dark[2] + (palette.mid[2] - palette.dark[2]) * factor;
      } else {
        // Light areas
        const factor = (intensity - 0.7) / 0.3;
        r = palette.mid[0] + (palette.light[0] - palette.mid[0]) * factor;
        g = palette.mid[1] + (palette.light[1] - palette.mid[1]) * factor;
        b = palette.mid[2] + (palette.light[2] - palette.mid[2]) * factor;
      }
      
      data[i] = Math.round(Math.max(0, Math.min(255, r)));     // R
      data[i + 1] = Math.round(Math.max(0, Math.min(255, g))); // G
      data[i + 2] = Math.round(Math.max(0, Math.min(255, b))); // B
      // Alpha remains unchanged
    }
  }

  /**
   * Get appropriate color scheme based on pattern category
   */
  private static getColorSchemeForCategory(category: string): number[][] {
    const schemes = {
      cosmic: [
        [138, 43, 226], [75, 0, 130], [0, 0, 255], [0, 255, 255], [255, 255, 0], [255, 165, 0]
      ],
      geometric: [
        [255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 255, 0], [0, 0, 255], [75, 0, 130], [148, 0, 211]
      ],
      natural: [
        [139, 69, 19], [34, 139, 34], [50, 205, 50], [0, 191, 255], [135, 206, 235], [255, 255, 224]
      ],
      abstract: [
        [220, 20, 60], [255, 140, 0], [255, 215, 0], [50, 205, 50], [0, 191, 255], [138, 43, 226]
      ]
    };
    
    // Default to rainbow if category not found
    const defaultScheme = [
      [255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 255, 0], [0, 0, 255], [75, 0, 130], [148, 0, 211]
    ];
    
    return schemes[category as keyof typeof schemes] || defaultScheme;
  }

  /**
   * Get a random artistic palette for single-color conversion
   */
  private static getRandomArtisticPalette() {
    const palettes = [
      // Sunset palette
      { 
        dark: [20, 5, 60], 
        mid: [180, 60, 20], 
        light: [255, 180, 80] 
      },
      // Ocean palette
      { 
        dark: [5, 20, 60], 
        mid: [20, 100, 180], 
        light: [80, 200, 255] 
      },
      // Forest palette
      { 
        dark: [10, 40, 5], 
        mid: [40, 120, 20], 
        light: [120, 200, 80] 
      },
      // Purple dream
      { 
        dark: [40, 5, 60], 
        mid: [120, 40, 180], 
        light: [200, 120, 255] 
      },
      // Fire palette
      { 
        dark: [60, 5, 5], 
        mid: [180, 40, 20], 
        light: [255, 120, 60] 
      },
      // Electric palette
      { 
        dark: [5, 40, 40], 
        mid: [40, 180, 120], 
        light: [120, 255, 200] 
      }
    ];
    
    return palettes[Math.floor(Math.random() * palettes.length)];
  }
}
