// Pattern Organization Index
// This file lists all patterns to be extracted

export const PATTERN_ORGANIZATION = {
  basic: [
    { name: 'Noise', method: 'generateNoisePattern', file: 'basicPatterns.ts', status: 'done' },
    { name: 'PerlinNoise', method: 'generatePerlinNoisePattern', file: 'basicPatterns.ts', status: 'done' },
    { name: 'Wave', method: 'generateWavePattern', file: 'basicPatterns.ts', status: 'done' },
    { name: 'Static', method: 'generateStaticPattern', file: 'basicPatterns.ts', status: 'done' }
  ],
  
  geometric: [
    { name: 'Cellular', method: 'generateCellularPattern', file: 'geometricPatterns.ts', status: 'done' },
    { name: 'Fractal', method: 'generateFractalPattern', file: 'geometricPatterns.ts', status: 'done' },
    { name: 'Voronoi', method: 'generateVoronoiPattern', file: 'geometricPatterns.ts', status: 'done' },
    { name: 'Spiral', method: 'generateSpiralPattern', file: 'geometricPatterns.ts', status: 'done' },
    { name: 'Honeycomb', method: 'generateHoneycombPattern', file: 'geometricPatterns.ts', status: 'done' },
    { name: 'Crystal', method: 'generateCrystalPattern', file: 'geometricPatterns.ts', status: 'pending' },
    { name: 'Mandala', method: 'generateMandalaPattern', file: 'geometricPatterns.ts', status: 'pending' }
  ],

  natural: [
    { name: 'Lightning', method: 'generateLightningPattern', file: 'naturalPatterns.ts', status: 'pending' },
    { name: 'Cloud', method: 'generateCloudPattern', file: 'naturalPatterns.ts', status: 'pending' },
    { name: 'Terrain', method: 'generateTerrainPattern', file: 'naturalPatterns.ts', status: 'pending' },
    { name: 'Organic', method: 'generateOrganicPattern', file: 'naturalPatterns.ts', status: 'pending' },
    { name: 'Faces', method: 'generateFacesPattern', file: 'naturalPatterns.ts', status: 'pending' },
    { name: 'Bodies', method: 'generateBodiesPattern', file: 'naturalPatterns.ts', status: 'pending' }
  ],

  abstract: [
    { name: 'InkBlot', method: 'generateInkBlot', file: 'abstractPatterns.ts', status: 'pending' },
    { name: 'PaintSplash', method: 'generatePaintSplash', file: 'abstractPatterns.ts', status: 'pending' },
    { name: 'FlowField', method: 'generateFlowField', file: 'abstractPatterns.ts', status: 'pending' },
    { name: 'AbstractArt', method: 'generateAbstractArt', file: 'abstractPatterns.ts', status: 'pending' },
    { name: 'Kaleidoscope', method: 'generateKaleidoscope', file: 'abstractPatterns.ts', status: 'pending' },
    { name: 'Morphing', method: 'generateMorphing', file: 'abstractPatterns.ts', status: 'pending' }
  ],

  cosmic: [
    { name: 'Galaxy', method: 'generateGalaxy', file: 'cosmicPatterns.ts', status: 'pending' },
    { name: 'Nebula', method: 'generateNebula', file: 'cosmicPatterns.ts', status: 'pending' },
    { name: 'Starfield', method: 'generateStarfield', file: 'cosmicPatterns.ts', status: 'pending' },
    { name: 'BlackHole', method: 'generateBlackHole', file: 'cosmicPatterns.ts', status: 'pending' },
    { name: 'Planets', method: 'generatePlanets', file: 'cosmicPatterns.ts', status: 'pending' },
    { name: 'Wormhole', method: 'generateWormhole', file: 'cosmicPatterns.ts', status: 'pending' }
  ],

  architectural: [
    { name: 'Gothic', method: 'generateGothic', file: 'architecturalPatterns.ts', status: 'pending' },
    { name: 'Modern', method: 'generateModern', file: 'architecturalPatterns.ts', status: 'pending' },
    { name: 'Blueprint', method: 'generateBlueprint', file: 'architecturalPatterns.ts', status: 'pending' },
    { name: 'Columns', method: 'generateColumns', file: 'architecturalPatterns.ts', status: 'pending' },
    { name: 'Bridges', method: 'generateBridges', file: 'architecturalPatterns.ts', status: 'pending' },
    { name: 'Cityscape', method: 'generateCityscape', file: 'architecturalPatterns.ts', status: 'pending' }
  ],

  texture: [
    { name: 'Marble', method: 'generateMarblePattern', file: 'texturePatterns.ts', status: 'pending' },
    { name: 'Wood', method: 'generateWoodPattern', file: 'texturePatterns.ts', status: 'pending' },
    { name: 'Lace', method: 'generateLacePattern', file: 'texturePatterns.ts', status: 'pending' }
  ],

  structural: [
    { name: 'Maze', method: 'generateMazePattern', file: 'structuralPatterns.ts', status: 'pending' },
    { name: 'Circuit', method: 'generateCircuitPattern', file: 'structuralPatterns.ts', status: 'pending' },
    { name: 'Neural', method: 'generateNeuralPattern', file: 'structuralPatterns.ts', status: 'pending' }
  ],

  glitch: [
    { name: 'Datamosh', method: 'generateDatamosh', file: 'glitchPatterns.ts', status: 'pending' },
    { name: 'ScanLines', method: 'generateScanLines', file: 'glitchPatterns.ts', status: 'pending' },
    { name: 'CorruptData', method: 'generateCorruptData', file: 'glitchPatterns.ts', status: 'pending' },
    { name: 'DigitalRain', method: 'generateDigitalRain', file: 'glitchPatterns.ts', status: 'pending' },
    { name: 'PixelSort', method: 'generatePixelSort', file: 'glitchPatterns.ts', status: 'pending' },
    { name: 'StaticInterference', method: 'generateStaticInterference', file: 'glitchPatterns.ts', status: 'pending' }
  ]
};

export const getTotalPatterns = () => {
  return Object.values(PATTERN_ORGANIZATION).reduce((total, category) => total + category.length, 0);
};

export const getPendingPatterns = () => {
  const pending: Array<{category: string, pattern: any}> = [];
  Object.entries(PATTERN_ORGANIZATION).forEach(([category, patterns]) => {
    patterns.forEach(pattern => {
      if (pattern.status === 'pending') {
        pending.push({ category, pattern });
      }
    });
  });
  return pending;
};
