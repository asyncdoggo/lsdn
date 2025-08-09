import type { Resolution } from './imageGenerator';
import * as BasicPatterns from './patterns/basic';
import * as GeometricPatterns from './patterns/geometric';
import * as StructuralPatterns from './patterns/structural';
import * as NaturalPatterns from './patterns/natural';
import * as TexturePatterns from './patterns/texture';
import * as AbstractPatterns from './patterns/abstract';
import * as CosmicPatterns from './patterns/cosmic';
import * as ArchitecturalPatterns from './patterns/architectural';
import * as GlitchPatterns from './patterns/glitch';

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

// Pattern generator interface for basic patterns (using data array)
interface BasicPatternGenerator {
  generate(data: Uint8ClampedArray, resolution: Resolution): void;
}

// Pattern generator interface for advanced patterns (using ImageData)
interface AdvancedPatternGenerator {
  generate(imageData: ImageData, width: number, height: number): void;
}

// Union type for all pattern generators
type PatternGenerator = BasicPatternGenerator | AdvancedPatternGenerator;

// Pattern metadata for color decisions
interface PatternInfo {
  generator: PatternGenerator;
  isAdvanced: boolean; // true if uses ImageData, false if uses data array
  isMulticolorCandidate: boolean;
  category: string;
}

/**
 * Centralized pattern registry that eliminates the need for large switch statements
 */
export class PatternRegistry {
  private static readonly patterns: Record<PatternType, PatternInfo> = {
    // Basic patterns
    noise: {
      generator: BasicPatterns.NoisePattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'basic'
    },
    perlin: {
      generator: BasicPatterns.PerlinNoisePattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'basic'
    },
    wave: {
      generator: BasicPatterns.WavePattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'basic'
    },
    static: {
      generator: BasicPatterns.StaticPattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'basic'
    },

    // Geometric patterns
    cellular: {
      generator: GeometricPatterns.CellularPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'geometric'
    },
    fractal: {
      generator: GeometricPatterns.FractalPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'geometric'
    },
    voronoi: {
      generator: GeometricPatterns.VoronoiPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'geometric'
    },
    spiral: {
      generator: GeometricPatterns.SpiralPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'geometric'
    },
    honeycomb: {
      generator: GeometricPatterns.HoneycombPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'geometric'
    },
    crystals: {
      generator: GeometricPatterns.CrystalPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'geometric'
    },
    mandala: {
      generator: GeometricPatterns.MandalaPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'geometric'
    },

    // Natural patterns
    lightning: {
      generator: NaturalPatterns.LightningPattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'natural'
    },
    cloud: {
      generator: NaturalPatterns.CloudPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'natural'
    },
    terrain: {
      generator: NaturalPatterns.TerrainPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'natural'
    },
    organic: {
      generator: NaturalPatterns.OrganicPattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'natural'
    },
    faces: {
      generator: NaturalPatterns.FacesPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'natural'
    },
    bodies: {
      generator: NaturalPatterns.BodiesPattern,
      isAdvanced: false,
      isMulticolorCandidate: true,
      category: 'natural'
    },

    // Structural patterns
    maze: {
      generator: StructuralPatterns.MazePattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'structural'
    },
    circuit: {
      generator: StructuralPatterns.CircuitPattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'structural'
    },
    neural: {
      generator: StructuralPatterns.NeuralPattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'structural'
    },

    // Texture patterns
    marble: {
      generator: TexturePatterns.MarblePattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'texture'
    },
    wood: {
      generator: TexturePatterns.WoodPattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'texture'
    },
    lace: {
      generator: TexturePatterns.LacePattern,
      isAdvanced: false,
      isMulticolorCandidate: false,
      category: 'texture'
    },

    // Abstract patterns
    ink: {
      generator: AbstractPatterns.InkBlotPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'abstract'
    },
    splash: {
      generator: AbstractPatterns.PaintSplashPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'abstract'
    },
    flow: {
      generator: AbstractPatterns.FlowFieldPattern,
      isAdvanced: true,
      isMulticolorCandidate: true,
      category: 'abstract'
    },
    abstract: {
      generator: AbstractPatterns.AbstractArtPattern,
      isAdvanced: true,
      isMulticolorCandidate: true,
      category: 'abstract'
    },
    kaleidoscope: {
      generator: AbstractPatterns.KaleidoscopePattern,
      isAdvanced: true,
      isMulticolorCandidate: true,
      category: 'abstract'
    },
    morphing: {
      generator: AbstractPatterns.MorphingPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'abstract'
    },

    // Cosmic patterns
    galaxy: {
      generator: CosmicPatterns.GalaxyPattern,
      isAdvanced: true,
      isMulticolorCandidate: true,
      category: 'cosmic'
    },
    nebula: {
      generator: CosmicPatterns.NebulaPattern,
      isAdvanced: true,
      isMulticolorCandidate: true,
      category: 'cosmic'
    },
    stars: {
      generator: CosmicPatterns.StarfieldPattern,
      isAdvanced: true,
      isMulticolorCandidate: true,
      category: 'cosmic'
    },
    blackhole: {
      generator: CosmicPatterns.BlackHolePattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'cosmic'
    },
    planets: {
      generator: CosmicPatterns.PlanetsPattern,
      isAdvanced: true,
      isMulticolorCandidate: true,
      category: 'cosmic'
    },
    wormhole: {
      generator: CosmicPatterns.WormholePattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'cosmic'
    },

    // Architectural patterns
    gothic: {
      generator: ArchitecturalPatterns.GothicPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'architectural'
    },
    modern: {
      generator: ArchitecturalPatterns.ModernPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'architectural'
    },
    blueprint: {
      generator: ArchitecturalPatterns.BlueprintPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'architectural'
    },
    columns: {
      generator: ArchitecturalPatterns.ColumnsPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'architectural'
    },
    bridges: {
      generator: ArchitecturalPatterns.BridgesPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'architectural'
    },
    cityscape: {
      generator: ArchitecturalPatterns.CityscapePattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'architectural'
    },

    // Glitch patterns
    datamosh: {
      generator: GlitchPatterns.DatamoshPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'glitch'
    },
    scan: {
      generator: GlitchPatterns.ScanLinesPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'glitch'
    },
    corrupt: {
      generator: GlitchPatterns.CorruptDataPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'glitch'
    },
    digital: {
      generator: GlitchPatterns.DigitalRainPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'glitch'
    },
    pixel: {
      generator: GlitchPatterns.PixelSortPattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'glitch'
    },
    static_interference: {
      generator: GlitchPatterns.StaticInterferencePattern,
      isAdvanced: true,
      isMulticolorCandidate: false,
      category: 'glitch'
    }
  };

  /**
   * Get pattern information by type
   */
  static getPatternInfo(pattern: PatternType): PatternInfo {
    const info = this.patterns[pattern];
    if (!info) {
      throw new Error(`Unknown pattern type: ${pattern}`);
    }
    return info;
  }

  /**
   * Generate a pattern using the registry
   */
  static generatePattern(
    pattern: PatternType, 
    imageData: ImageData, 
    resolution: Resolution
  ): void {
    const info = this.getPatternInfo(pattern);
    
    if (info.isAdvanced) {
      // Advanced patterns use ImageData interface
      (info.generator as AdvancedPatternGenerator).generate(
        imageData, 
        resolution.width, 
        resolution.height
      );
    } else {
      // Basic patterns use data array interface
      (info.generator as BasicPatternGenerator).generate(
        imageData.data, 
        resolution
      );
    }
  }

  /**
   * Check if a pattern is a multicolor candidate
   */
  static isMulticolorCandidate(pattern: PatternType): boolean {
    return this.getPatternInfo(pattern).isMulticolorCandidate;
  }

  /**
   * Get all available pattern types
   */
  static getAllPatternTypes(): PatternType[] {
    return Object.keys(this.patterns) as PatternType[];
  }

  /**
   * Get patterns by category
   */
  static getPatternsByCategory(category: string): PatternType[] {
    return Object.entries(this.patterns)
      .filter(([_, info]) => info.category === category)
      .map(([pattern, _]) => pattern as PatternType);
  }

  /**
   * Get pattern category
   */
  static getPatternCategory(pattern: PatternType): string {
    return this.getPatternInfo(pattern).category;
  }
}
