import { PatternRegistry, type PatternType } from './patternRegistry';
import { ColorManager } from './colorManager';
import { CanvasUtils } from './canvasUtils';
import { TextToImageGenerator, type TextToImageOptions } from './textToImageGenerator';
import type { SchedulerType } from './schedulers';

export interface Resolution {
  width: number;
  height: number;
}

export type ResolutionKey = '64' | '128' | '256' | '512' | '1024' | '1536' | '4MP' | '8MP' | '12MP';

// Re-export PatternType from the registry
export type { PatternType };

export class ImageGenerator {
  private resolutions: Record<string, Resolution> = {
    '64': { width: 64, height: 64 },       // 0.004 megapixels
    '128': { width: 128, height: 128 },     // 0.016 megapixels
    '256': { width: 256, height: 256 },     // 0.065 megapixels
    '512': { width: 512, height: 512 },     // 0.26 megapixels
    '1024': { width: 1024, height: 1024 },  // 1 megapixel
    '1536': { width: 1536, height: 1536 },  // 2.36 megapixels
    '4MP': { width: 2048, height: 1952 },   // ~4 megapixels
    '8MP': { width: 2896, height: 2760 },   // ~8 megapixels  
    '12MP': { width: 3456, height: 3456 }   // ~12 megapixels
  };

  private textToImageGenerator: TextToImageGenerator | null = null;

  /**
   * Generates a random black and white image on the provided canvas
   */
  generateRandomImage(canvas: HTMLCanvasElement, resolutionKey: ResolutionKey): void {
    const resolution = this.resolutions[resolutionKey];
    const ctx = CanvasUtils.setupCanvas(canvas, resolution);
    
    // Create image data
    const imageData = ctx.createImageData(resolution.width, resolution.height);
    const data = imageData.data;

    // Generate random black and white pixels
    for (let i = 0; i < data.length; i += 4) {
      // Generate random grayscale value (0-255)
      const value = Math.random() > 0.5 ? 255 : 0; // Pure black or white
      
      data[i] = value;     // Red
      data[i + 1] = value; // Green  
      data[i + 2] = value; // Blue
      data[i + 3] = 255;   // Alpha (fully opaque)
    }

    // Draw the image data to canvas
    ctx.putImageData(imageData, 0, 0);
    
    // Scale canvas display size to fit the screen while maintaining aspect ratio
    CanvasUtils.scaleCanvasDisplay(canvas, resolution);
  }

  /**
   * Generates a sophisticated pattern using the pattern registry
   */
  generatePatternImage(
    canvas: HTMLCanvasElement, 
    resolutionKey: ResolutionKey,
    pattern: PatternType = 'noise',
    isColorMode: boolean = false
  ): void {
    const resolution = this.resolutions[resolutionKey];
    const ctx = CanvasUtils.setupCanvas(canvas, resolution);
    
    const imageData = ctx.createImageData(resolution.width, resolution.height);

    // Use the pattern registry to generate the pattern
    PatternRegistry.generatePattern(pattern, imageData, resolution);

    // Convert to color if color mode is enabled
    if (isColorMode) {
      ColorManager.convertToColor(imageData, pattern);
    }

    ctx.putImageData(imageData, 0, 0);
    CanvasUtils.scaleCanvasDisplay(canvas, resolution);
  }

  /**
   * Async wrapper for pattern generation to prevent UI blocking
   */
  async generatePatternImageAsync(
    canvas: HTMLCanvasElement, 
    resolutionKey: ResolutionKey,
    pattern: PatternType = 'noise',
    isColorMode: boolean = false,
    onProgress?: (progress: number) => void
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      // Report initial progress
      if (onProgress) onProgress(0.1);
      
      // Use setTimeout to yield control to the browser
      setTimeout(() => {
        try {
          if (onProgress) onProgress(0.3);
          
          // Use another timeout to break up the work further
          setTimeout(() => {
            try {
              if (onProgress) onProgress(0.6);
              
              // Generate the image using the existing sync method
              this.generatePatternImage(canvas, resolutionKey, pattern, isColorMode);
              
              if (onProgress) onProgress(1.0);
              resolve();
            } catch (error) {
              reject(error);
            }
          }, 10);
        } catch (error) {
          reject(error);
        }
      }, 10);
    });
  }

  /**
   * Downloads the canvas content as a PNG image
   */
  downloadImage(canvas: HTMLCanvasElement, filename: string): void {
    CanvasUtils.downloadImage(canvas, filename);
  }

  /**
   * Gets the actual dimensions for a resolution key
   */
  getResolutionDimensions(resolutionKey: '4MP' | '8MP' | '12MP'): Resolution {
    return this.resolutions[resolutionKey];
  }

  /**
   * Get all available pattern types from the registry
   */
  getAvailablePatterns(): PatternType[] {
    return PatternRegistry.getAllPatternTypes();
  }

  /**
   * Get patterns by category
   */
  getPatternsByCategory(category: string): PatternType[] {
    return PatternRegistry.getPatternsByCategory(category);
  }

  /**
   * Initialize the text-to-image generator and load ONNX models
   */
  async initializeTextToImage(onProgress?: (stage: string, progress: number) => void): Promise<void> {
    if (!this.textToImageGenerator) {
      this.textToImageGenerator = new TextToImageGenerator();
    }
    
    if (!this.textToImageGenerator.modelsLoaded) {
      await this.textToImageGenerator.loadModels(onProgress);
    }
  }

  /**
   * Generate image from text prompt using Stable Diffusion
   */
  async generateFromText(
    canvas: HTMLCanvasElement,
    prompt: string,
    options: {
      negativePrompt?: string;
      resolutionKey?: ResolutionKey;
      steps?: number;
      guidance?: number;
      seed?: number;
      scheduler?: SchedulerType;
      useTiledVAE?: boolean;
      lowMemoryMode?: boolean;
      tileSize?: number;
    } = {},
    onProgress?: (stage: string, progress: number) => void,
    onPreview?: (previewImageData: ImageData) => void
  ): Promise<void> {
    if (!this.textToImageGenerator) {
      throw new Error('Text-to-image generator not initialized. Call initializeTextToImage() first.');
    }

    const {
      negativePrompt = '',
      resolutionKey = '512',
      steps = 20,
      guidance = 7.5,
      seed,
      scheduler = 'euler-karras',
      useTiledVAE = true,
      lowMemoryMode = true,
      tileSize = 256
    } = options;

    const resolution = this.resolutions[resolutionKey];
    
    // Support resolutions up to 512x512 for ONNX web inference
    if (resolution.width > 512 || resolution.height > 512) {
      throw new Error('Text-to-image generation is currently limited to 512x512 resolution for performance reasons.');
    }

    const textToImageOptions: TextToImageOptions = {
      prompt,
      negativePrompt,
      width: resolution.width,
      height: resolution.height,
      steps,
      guidance,
      seed,
      scheduler: scheduler as SchedulerType,
      useTiledVAE,
      lowMemoryMode,
      tileSize
    };

    // Generate the image
    const imageData = await this.textToImageGenerator.generateImage(textToImageOptions, onProgress, onPreview);

    // Setup canvas and display the generated image
    const ctx = CanvasUtils.setupCanvas(canvas, resolution);
    ctx.putImageData(imageData, 0, 0);
    CanvasUtils.scaleCanvasDisplay(canvas, resolution);
  }

  /**
   * Check if text-to-image models are loaded and ready
   */
  get isTextToImageReady(): boolean {
    return this.textToImageGenerator?.modelsLoaded ?? false;
  }

  /**
   * Cancel the current text-to-image generation
   */
  cancelTextToImageGeneration(): void {
    if (this.textToImageGenerator) {
      this.textToImageGenerator.cancelGeneration();
    }
  }

  /**
   * Dispose of text-to-image resources
   */
  async disposeTextToImage(): Promise<void> {
    if (this.textToImageGenerator) {
      await this.textToImageGenerator.dispose();
      this.textToImageGenerator = null;
    }
  }
}
