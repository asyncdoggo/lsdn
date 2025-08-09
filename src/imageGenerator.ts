// Import all patterns from their modular structure
import * as BasicPatterns from './patterns/basic';
import * as GeometricPatterns from './patterns/geometric';
import * as StructuralPatterns from './patterns/structural';
import * as NaturalPatterns from './patterns/natural';
import * as TexturePatterns from './patterns/texture';
import * as AbstractPatterns from './patterns/abstract';
import * as CosmicPatterns from './patterns/cosmic';
import * as ArchitecturalPatterns from './patterns/architectural';
import * as GlitchPatterns from './patterns/glitch';

export interface Resolution {
  width: number;
  height: number;
}

export type PatternType = 
  // Basic patterns
  | 'noise' 
  | 'perlin' 
  | 'wave' 
  | 'static'
  // Geometric patterns
  | 'cellular' 
  | 'fractal' 
  | 'voronoi' 
  | 'spiral'
  | 'honeycomb'
  | 'crystals'
  | 'mandala'
  // Natural patterns
  | 'lightning' 
  | 'cloud' 
  | 'terrain' 
  | 'organic'
  | 'faces'
  | 'bodies'
  // Structural patterns
  | 'maze' 
  | 'circuit' 
  | 'neural'
  // Texture patterns
  | 'marble' 
  | 'wood' 
  | 'lace'
  // Abstract patterns
  | 'ink'
  | 'splash'
  | 'flow'
  | 'abstract'
  | 'kaleidoscope'
  | 'morphing'
  // Cosmic patterns
  | 'galaxy'
  | 'nebula'
  | 'stars'
  | 'blackhole'
  | 'planets'
  | 'wormhole'
  // Architectural patterns
  | 'gothic'
  | 'modern'
  | 'blueprint'
  | 'columns'
  | 'bridges'
  | 'cityscape'
  // Glitch patterns
  | 'datamosh'
  | 'scan'
  | 'corrupt'
  | 'digital'
  | 'pixel'
  | 'static_interference';

export class ImageGenerator {
  private resolutions: Record<string, Resolution> = {
    '4MP': { width: 2048, height: 1952 },   // ~4 megapixels
    '8MP': { width: 2896, height: 2760 },   // ~8 megapixels  
    '12MP': { width: 3456, height: 3456 }   // ~12 megapixels
  };

  /**
   * Generates a random black and white image on the provided canvas
   * @param canvas The HTML canvas element to draw on
   * @param resolutionKey The resolution key ('4MP', '8MP', or '12MP')
   */
  generateRandomImage(canvas: HTMLCanvasElement, resolutionKey: '4MP' | '8MP' | '12MP'): void {
    const resolution = this.resolutions[resolutionKey];
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Unable to get canvas context');
    }

    // Set canvas dimensions
    canvas.width = resolution.width;
    canvas.height = resolution.height;
    
    // Create image data
    const imageData = ctx.createImageData(resolution.width, resolution.height);
    const data = imageData.data;

    // Generate random black and white pixels
    for (let i = 0; i < data.length; i += 4) {
      // Generate random grayscale value (0-255)
      const value = Math.random() > 0.5 ? 255 : 0; // Pure black or white
      
      // Alternatively, for more gradual grayscale:
      // const value = Math.floor(Math.random() * 256);
      
      data[i] = value;     // Red
      data[i + 1] = value; // Green  
      data[i + 2] = value; // Blue
      data[i + 3] = 255;   // Alpha (fully opaque)
    }

    // Draw the image data to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Scale canvas display size to fit the screen while maintaining aspect ratio
    this.scaleCanvasDisplay(canvas, resolution);
  }

  /**
   * Generates a more sophisticated random pattern using noise algorithms
   * @param canvas The HTML canvas element to draw on
   * @param resolutionKey The resolution key
   * @param pattern The pattern type to generate
   * @param isColorMode Whether to generate in color mode
   */
  generatePatternImage(
    canvas: HTMLCanvasElement, 
    resolutionKey: '4MP' | '8MP' | '12MP',
    pattern: PatternType = 'noise',
    isColorMode: boolean = false
  ): void {
    // Track current pattern for color decisions
    this.currentPattern = pattern;
    
    const resolution = this.resolutions[resolutionKey];
    const ctx = canvas.getContext('2d');
    
    if (!ctx) {
      throw new Error('Unable to get canvas context');
    }

    canvas.width = resolution.width;
    canvas.height = resolution.height;
    
    const imageData = ctx.createImageData(resolution.width, resolution.height);
    const data = imageData.data;

    switch (pattern) {
      // Basic patterns
      case 'noise':
        BasicPatterns.NoisePattern.generate(data, resolution);
        break;
      case 'perlin':
        BasicPatterns.PerlinNoisePattern.generate(data, resolution);
        break;
      case 'wave':
        BasicPatterns.WavePattern.generate(data, resolution);
        break;
      case 'static':
        BasicPatterns.StaticPattern.generate(data, resolution);
        break;
      
      // Geometric patterns
      case 'cellular':
        GeometricPatterns.CellularPattern.generate(data, resolution);
        break;
      case 'fractal':
        GeometricPatterns.FractalPattern.generate(data, resolution);
        break;
      case 'voronoi':
        GeometricPatterns.VoronoiPattern.generate(data, resolution);
        break;
      case 'spiral':
        GeometricPatterns.SpiralPattern.generate(data, resolution);
        break;
      case 'honeycomb':
        GeometricPatterns.HoneycombPattern.generate(data, resolution);
        break;
      case 'crystals':
        GeometricPatterns.CrystalPattern.generate(data, resolution);
        break;
      case 'mandala':
        GeometricPatterns.MandalaPattern.generate(data, resolution);
        break;
      
      // Natural patterns
      case 'lightning':
        NaturalPatterns.LightningPattern.generate(data, resolution);
        break;
      case 'cloud':
        NaturalPatterns.CloudPattern.generate(data, resolution);
        break;
      case 'terrain':
        NaturalPatterns.TerrainPattern.generate(data, resolution);
        break;
      case 'organic':
        NaturalPatterns.OrganicPattern.generate(data, resolution);
        break;
      case 'faces':
        NaturalPatterns.FacesPattern.generate(data, resolution);
        break;
      case 'bodies':
        NaturalPatterns.BodiesPattern.generate(data, resolution);
        break;
      
      // Structural patterns
      case 'maze':
        StructuralPatterns.MazePattern.generate(data, resolution);
        break;
      case 'circuit':
        StructuralPatterns.CircuitPattern.generate(data, resolution);
        break;
      case 'neural':
        StructuralPatterns.NeuralPattern.generate(data, resolution);
        break;
      
      // Texture patterns
      case 'marble':
        TexturePatterns.MarblePattern.generate(data, resolution);
        break;
      case 'wood':
        TexturePatterns.WoodPattern.generate(data, resolution);
        break;
      case 'lace':
        TexturePatterns.LacePattern.generate(data, resolution);
        break;
      
      // Abstract patterns
      case 'ink':
        AbstractPatterns.InkBlotPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'splash':
        AbstractPatterns.PaintSplashPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'flow':
        AbstractPatterns.FlowFieldPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'abstract':
        AbstractPatterns.AbstractArtPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'kaleidoscope':
        AbstractPatterns.KaleidoscopePattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'morphing':
        AbstractPatterns.MorphingPattern.generate(imageData, resolution.width, resolution.height);
        break;
      
      // Cosmic patterns
      case 'galaxy':
        CosmicPatterns.GalaxyPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'nebula':
        CosmicPatterns.NebulaPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'stars':
        CosmicPatterns.StarfieldPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'blackhole':
        CosmicPatterns.BlackHolePattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'planets':
        CosmicPatterns.PlanetsPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'wormhole':
        CosmicPatterns.WormholePattern.generate(imageData, resolution.width, resolution.height);
        break;
      
      // Architectural patterns
      case 'gothic':
        ArchitecturalPatterns.GothicPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'modern':
        ArchitecturalPatterns.ModernPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'blueprint':
        ArchitecturalPatterns.BlueprintPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'columns':
        ArchitecturalPatterns.ColumnsPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'bridges':
        ArchitecturalPatterns.BridgesPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'cityscape':
        ArchitecturalPatterns.CityscapePattern.generate(imageData, resolution.width, resolution.height);
        break;
      
      // Glitch patterns
      case 'datamosh':
        GlitchPatterns.DatamoshPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'scan':
        GlitchPatterns.ScanLinesPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'corrupt':
        GlitchPatterns.CorruptDataPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'digital':
        GlitchPatterns.DigitalRainPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'pixel':
        GlitchPatterns.PixelSortPattern.generate(imageData, resolution.width, resolution.height);
        break;
      case 'static_interference':
        GlitchPatterns.StaticInterferencePattern.generate(imageData, resolution.width, resolution.height);
        break;
    }

    // Convert to color if color mode is enabled
    if (isColorMode) {
      this.convertToColor(imageData);
    }

    ctx.putImageData(imageData, 0, 0);
    this.scaleCanvasDisplay(canvas, resolution);
  }

  /**
   * Converts a black and white image to color using artistic color palettes
   */
  private convertToColor(imageData: ImageData): void {
    const data = imageData.data;
    
    // Determine if this pattern benefits from multicolor treatment
    const isMulticolorPattern = this.isMulticolorCandidate(this.currentPattern);
    
    if (isMulticolorPattern) {
      this.applyMulticolorConversion(data);
    } else {
      this.applySinglePaletteConversion(data);
    }
  }

  /**
   * Tracks the current pattern for color decisions
   */
  private currentPattern: PatternType = 'noise';

  /**
   * Determines if a pattern should get multicolor treatment
   */
  private isMulticolorCandidate(pattern: PatternType): boolean {
    const multicolorPatterns: PatternType[] = [
      // Geometric patterns - perfect for multicolor
      'mandala', 'spiral', 'crystals', 'voronoi', 'honeycomb', 'fractal',
      
      // Abstract patterns - excellent for color mapping
      'kaleidoscope', 'flow', 'abstract',
      
      // Cosmic patterns - natural color candidates
      'galaxy', 'nebula', 'planets', 'stars',
      
      // Natural patterns with distinct regions
      'terrain', 'faces', 'bodies', 'cloud'
    ];
    
    return multicolorPatterns.includes(pattern);
  }

  /**
   * Applies sophisticated multicolor conversion for compatible patterns
   */
  private applyMulticolorConversion(data: Uint8ClampedArray): void {
    // Choose multicolor scheme based on pattern type
    const colorSchemes = {
      cosmic: [
        [138, 43, 226], [75, 0, 130], [0, 0, 255], [0, 255, 255], [255, 255, 0], [255, 165, 0]
      ],
      rainbow: [
        [255, 0, 0], [255, 127, 0], [255, 255, 0], [0, 255, 0], [0, 0, 255], [75, 0, 130], [148, 0, 211]
      ],
      jewel: [
        [139, 69, 19], [220, 20, 60], [255, 140, 0], [50, 205, 50], [0, 191, 255], [138, 43, 226]
      ],
      thermal: [
        [0, 0, 255], [0, 255, 255], [0, 255, 0], [255, 255, 0], [255, 127, 0], [255, 0, 0]
      ]
    };
    
    const schemeNames = Object.keys(colorSchemes) as (keyof typeof colorSchemes)[];
    const chosenScheme = colorSchemes[schemeNames[Math.floor(Math.random() * schemeNames.length)]];
    
    for (let i = 0; i < data.length; i += 4) {
      const gray = data[i]; // Get grayscale value
      const intensity = gray / 255;
      
      // Map intensity to color scheme
      const colorIndex = Math.floor(intensity * (chosenScheme.length - 1));
      const nextColorIndex = Math.min(colorIndex + 1, chosenScheme.length - 1);
      
      // Interpolate between colors for smooth gradients
      const t = (intensity * (chosenScheme.length - 1)) - colorIndex;
      
      const color1 = chosenScheme[colorIndex];
      const color2 = chosenScheme[nextColorIndex];
      
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
  private applySinglePaletteConversion(data: Uint8ClampedArray): void {
    // Choose a random color palette
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
    
    const palette = palettes[Math.floor(Math.random() * palettes.length)];
    
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
   * Scales the canvas display size to fit the viewport
   */
  private scaleCanvasDisplay(canvas: HTMLCanvasElement, resolution: Resolution): void {
    const maxDisplayWidth = Math.min(800, window.innerWidth - 40);
    const maxDisplayHeight = Math.min(600, window.innerHeight - 200);
    
    const aspectRatio = resolution.width / resolution.height;
    let displayWidth = maxDisplayWidth;
    let displayHeight = displayWidth / aspectRatio;
    
    if (displayHeight > maxDisplayHeight) {
      displayHeight = maxDisplayHeight;
      displayWidth = displayHeight * aspectRatio;
    }
    
    canvas.style.width = `${displayWidth}px`;
    canvas.style.height = `${displayHeight}px`;
  }

  /**
   * Downloads the canvas content as a PNG image
   * @param canvas The canvas to download
   * @param filename The filename for the download
   */
  downloadImage(canvas: HTMLCanvasElement, filename: string): void {
    const link = document.createElement('a');
    link.download = filename;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  /**
   * Gets the actual dimensions for a resolution key
   */
  getResolutionDimensions(resolutionKey: '4MP' | '8MP' | '12MP'): Resolution {
    return this.resolutions[resolutionKey];
  }
}
