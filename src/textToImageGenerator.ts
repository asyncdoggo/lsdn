import * as ort from 'onnxruntime-web/webgpu';
import { AutoTokenizer, env, PreTrainedTokenizer } from '@xenova/transformers';
import { BaseScheduler, SchedulerRegistry } from './schedulers';
import type { SchedulerType } from './schedulers';
import { NoiseGenerator } from './utils/noiseGenerator';
import { TensorPool } from './utils/tensorPool';
import { AsyncPipeline, OptimizedTensorOps } from './utils/asyncPipeline';
import { PerformanceMonitor, timed } from './utils/performanceMonitor';

// Do not change the below or PretrainedTokenizer will not work
env.allowLocalModels = false;
env.useBrowserCache = false;

export interface TextToImageOptions {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  guidance: number;
  seed?: number;
  scheduler?: SchedulerType;
  useTiledVAE?: boolean;  // Use tiled VAE to reduce memory usage
  tileSize?: number;      // Size of tiles (defaults to 512)
}


const BASE_URL = "https://huggingface.co/subpixel/small-stable-diffusion-v0-onnx-ort-web/resolve/main";

const urls = {
  "unet": `${BASE_URL}/unet/model.onnx`,
  "textEncoder": `${BASE_URL}/text_encoder/model.onnx`,
  "vaeDecoder": `${BASE_URL}/vae_decoder/model.onnx`,
  "weights_url": `${BASE_URL}/unet/weights.pb`
}

export class TextToImageGenerator {
  private models: {
    textEncoder?: { sess: ort.InferenceSession };
    unet?: { sess: ort.InferenceSession };
    vaeDecoder?: { sess: ort.InferenceSession };
  } = {};
  private isLoaded = false;
  private tokenizer: PreTrainedTokenizer | null = null;
  private currentLatentDimensions: [number, number] | null = null;
  private scheduler: BaseScheduler;
  private noiseGenerator: NoiseGenerator;
  private tensorPool = TensorPool.getInstance();
  private asyncPipeline = new AsyncPipeline();
  private performanceMonitor = PerformanceMonitor.getInstance();
  private isCancelled: boolean = false;

  // Model configuration templates
  private readonly modelConfig = {
    textEncoder: {
      url: urls.textEncoder,
      opt: { 
        freeDimensionOverrides: { batch_size: 1 },
        executionProviders: ['webgpu'],
        enableMemPattern: false,
        enableCpuMemArena: false,
        extra: {
          session: {
            disable_prepacking: "1",
            use_device_allocator_for_initializers: "1",
            use_ort_model_bytes_directly: "1",
            use_ort_model_bytes_for_initializers: "1"
          }
        }
      }
    },
    unet: {
      url: urls.unet,
      weightsUrl: urls.weights_url,
      baseOpt: { 
        externalData: [{
          path: './weights.pb',
          data: urls.weights_url
        }],
        executionProviders: ['webgpu'],
        enableMemPattern: false,
        enableCpuMemArena: false,
        graphOptimizationLevel: 'all' as const,
        executionMode: 'parallel' as const,
        interOpNumThreads: 0, // Use all available threads
        intraOpNumThreads: 0, // Use all available threads
        extra: {
          session: {
            disable_prepacking: "0", // Enable prepacking for better performance
            use_device_allocator_for_initializers: "1",
            use_ort_model_bytes_directly: "1",
            use_ort_model_bytes_for_initializers: "1",
            enable_cpu_mem_arena: "0",
            enable_mem_pattern: "0",
            execution_mode: "ORT_PARALLEL", // Parallel execution
            inter_op_num_threads: "0", // Use all threads
            intra_op_num_threads: "0", // Use all threads
          }
        }
      }
    },
    vaeDecoder: {
      url: urls.vaeDecoder,
      baseOpt: { 
        executionProviders: ['webgpu'],
        enableMemPattern: false,
        enableCpuMemArena: false,
        extra: {
          session: {
            disable_prepacking: "1",
            use_device_allocator_for_initializers: "1",
            use_ort_model_bytes_directly: "1",
            use_ort_model_bytes_for_initializers: "1"
          }
        }
      }
    }
  };

  // Constants for SD pipeline
  private readonly vaeScalingFactor = 0.18215;
  
  // Tensor cache for performance optimization
  private tensorCache: {
    guidedOutputData?: Float16Array;
    timestepData?: Float16Array;
    batchedTimestepData?: Float16Array;
  } = {};

  constructor(schedulerType: SchedulerType = 'euler-karras') {
    // Initialize scheduler and noise generator
    this.scheduler = SchedulerRegistry.createScheduler(schedulerType);
    this.noiseGenerator = new NoiseGenerator();

    // Configure ONNX Runtime
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
    ort.env.wasm.numThreads = 1;
    ort.env.logLevel = 'warning';

    // Check WebGPU support
    if (!('gpu' in navigator)) {
      console.warn('WebGPU not supported, falling back to WASM');
      // Fallback to WASM for all models
      this.modelConfig.textEncoder.opt.executionProviders = ['wasm'];
      this.modelConfig.unet.baseOpt.executionProviders = ['wasm'];
      this.modelConfig.vaeDecoder.baseOpt.executionProviders = ['wasm'];
    }
  }

  /**
   * Generate latent dimensions based on actual image dimensions
   */
  private getLatentDimensions(width: number, height: number): [number, number] {
    // VAE encoder downsamples by factor of 8
    return [height / 8, width / 8];
  }

  /**
   * Create UNet session with specific dimensions
   */
  private async createUNetSession(latentHeight: number, latentWidth: number): Promise<ort.InferenceSession> {
    const unetBytes = await this.fetchAndCache(this.modelConfig.unet.url);
    let weightsBytes = new ArrayBuffer(0);
    
    if (this.modelConfig.unet.weightsUrl) {
      weightsBytes = await this.fetchAndCache(this.modelConfig.unet.weightsUrl);
    }

    const unetOptions = {
      ...this.modelConfig.unet.baseOpt,
      freeDimensionOverrides: {
        batch_size: 2, // Support batched CFG inference (negative + positive)
        num_channels: 4, 
        height: latentHeight, 
        width: latentWidth, 
        sequence_length: 77 
      },
      externalData: this.modelConfig.unet.weightsUrl ? [{
        data: weightsBytes,
        path: "./weights.pb"
      }] : undefined
    };

    return await ort.InferenceSession.create(unetBytes, unetOptions);
  }

  /**
   * Create VAE decoder session with specific dimensions
   */
  private async createVAESession(latentHeight: number, latentWidth: number): Promise<ort.InferenceSession> {
    const vaeBytes = await this.fetchAndCache(this.modelConfig.vaeDecoder.url);
    
    const vaeOptions = {
      ...this.modelConfig.vaeDecoder.baseOpt,
      freeDimensionOverrides: {
        batch_size: 1, 
        num_channels_latent: 4, 
        height_latent: latentHeight, 
        width_latent: latentWidth 
      }
    };

    return await ort.InferenceSession.create(vaeBytes, vaeOptions);
  }

  /**
   * Set the scheduler type
   */
  setScheduler(schedulerType: SchedulerType): void {
    this.scheduler = SchedulerRegistry.createScheduler(schedulerType);
  }

  /**
   * Create output tensor for final image (optimized with tensor pool)
   */
  private createOutputTensor(channels: number, height: number, width: number): ort.Tensor {
    const tensor = this.tensorPool.getTensor('float32', [1, channels, height, width]);
    this.performanceMonitor.recordTensorOp('create', tensor.size * 4); // 4 bytes per float32
    return tensor;
  }

  /**
   * Create weight tensor for blending (optimized with tensor pool)
   */
  private createWeightTensor(channels: number, height: number, width: number): ort.Tensor {
    const tensor = this.tensorPool.getTensor('float32', [1, channels, height, width]);
    this.performanceMonitor.recordTensorOp('create', tensor.size * 4); // 4 bytes per float32
    return tensor;
  }

  /**
   * Optimized tensor disposal with proper pool tracking
   */
  private disposeTensor(tensor: ort.Tensor): void {
    // Return to pool for reuse
    this.tensorPool.returnTensor(tensor);
    this.performanceMonitor.recordTensorOp('dispose');
  }
  private async decodeTiledVAE(
    latent: ort.Tensor, 
    width: number, 
    height: number, 
    tileSize: number = 512,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<ort.Tensor> {
    const latentHeight = height / 8; // VAE downsamples by factor of 8
    const latentWidth = width / 8;
    const tileSizeLatent = tileSize / 8; // Convert tile size to latent space
    
    // Add overlap to reduce seams (in latent space)
    const overlapLatent = Math.min(tileSizeLatent / 4, 8); // 25% overlap, max 64px in image space
    const strideLatent = tileSizeLatent - overlapLatent;
    
    // Calculate number of tiles needed with overlap
    const tilesX = Math.ceil((latentWidth - overlapLatent) / strideLatent);
    const tilesY = Math.ceil((latentHeight - overlapLatent) / strideLatent);
    const totalTiles = tilesX * tilesY;
    
    console.log(`🧩 Using tiled VAE: ${tilesX}x${tilesY} tiles (${totalTiles} total), tile size: ${tileSize}px, overlap: ${overlapLatent * 8}px`);
    
    // Create output tensor for final image (using optimized tensor pool)
    const outputChannels = 3; // RGB
    const outputTensor = this.createOutputTensor(outputChannels, height, width);
    
    // Create weight tensor for blending overlapping regions (using optimized tensor pool)
    const weightTensor = this.createWeightTensor(outputChannels, height, width);
    
    // Create a single VAE session that can handle the maximum tile size (with overlap)
    const maxTileSizeLatent = tileSizeLatent + overlapLatent;
    const vaeSession = await this.createVAESession(maxTileSizeLatent, maxTileSizeLatent);
    
    try {
      let processedTiles = 0;
      
      for (let tileY = 0; tileY < tilesY; tileY++) {
        for (let tileX = 0; tileX < tilesX; tileX++) {
          // Calculate tile boundaries in latent space with overlap
          const startX = tileX * strideLatent;
          const startY = tileY * strideLatent;
          const endX = Math.min(startX + tileSizeLatent, latentWidth);
          const endY = Math.min(startY + tileSizeLatent, latentHeight);
          
          const tileLatentWidth = endX - startX;
          const tileLatentHeight = endY - startY;
          
          // Extract tile from latent tensor
          const tileLatent = this.extractTile(latent, startX, startY, tileLatentWidth, tileLatentHeight);
          
          // If tile is smaller than max tile size, pad it to match VAE session dimensions
          const paddedTileLatent = this.padTileIfNeeded(tileLatent, maxTileSizeLatent, maxTileSizeLatent);
          
          // Decode the tile using the shared VAE session
          const tileResult = await vaeSession.run({
            latent_sample: paddedTileLatent
          });
          
          const tileSample = tileResult.sample as ort.Tensor;
          
          // Calculate output boundaries in pixel space
          const outputStartX = startX * 8;
          const outputStartY = startY * 8;
          const outputEndX = endX * 8;
          const outputEndY = endY * 8;
          
          // Create feather mask for blending
          const featherMask = this.createFeatherMask(
            tileLatentWidth * 8, 
            tileLatentHeight * 8, 
            overlapLatent * 8,
            tileX === 0, // isLeftEdge
            tileY === 0, // isTopEdge
            tileX === tilesX - 1, // isRightEdge
            tileY === tilesY - 1  // isBottomEdge
          );
          
          // Copy tile data to output tensor with blending
          this.blendTileToOutput(
            tileSample, 
            outputTensor, 
            weightTensor,
            featherMask,
            outputStartX, 
            outputStartY, 
            outputEndX, 
            outputEndY, 
            tileLatentWidth * 8, 
            tileLatentHeight * 8
          );
          
          // Dispose intermediate tensors
          this.disposeTensor(tileLatent);
          this.disposeTensor(paddedTileLatent);
          this.disposeTensor(tileSample);
          
          processedTiles++;
          
          if (onProgress) {
            const progress = 0.8 + (processedTiles / totalTiles) * 0.1; // Progress from 0.8 to 0.9
            onProgress(`Decoding tile ${processedTiles}/${totalTiles}`, progress);
          }
          
          console.log(`  🧩 Processed tile ${processedTiles}/${totalTiles} (${tileX},${tileY})`);
        }
      }
      
      // Normalize the output by dividing by the accumulated weights
      this.normalizeBlendedOutput(outputTensor, weightTensor);
      
      // Dispose weight tensor since we're done with it
      this.disposeTensor(weightTensor);
      
    } finally {
      // Clean up the single VAE session after processing all tiles
      await vaeSession.release();
    }
    
    return outputTensor;
  }

  /**
   * Pad a tile tensor to match the expected VAE session dimensions
   */
  private padTileIfNeeded(
    tileLatent: ort.Tensor,
    targetHeight: number,
    targetWidth: number
  ): ort.Tensor {
    const [batch, channels, currentHeight, currentWidth] = tileLatent.dims as [number, number, number, number];
    
    // If tile is already the right size, return as-is
    if (currentHeight === targetHeight && currentWidth === targetWidth) {
      return tileLatent;
    }
    
    // Create padded tensor
    const paddedData = new Float16Array(batch * channels * targetHeight * targetWidth);
    const inputData = tileLatent.data as Float16Array;
    
    // Copy original data to top-left corner of padded tensor
    for (let b = 0; b < batch; b++) {
      for (let c = 0; c < channels; c++) {
        for (let y = 0; y < currentHeight; y++) {
          for (let x = 0; x < currentWidth; x++) {
            const srcIdx = b * (channels * currentHeight * currentWidth) + 
                          c * (currentHeight * currentWidth) + 
                          y * currentWidth + x;
            const dstIdx = b * (channels * targetHeight * targetWidth) + 
                          c * (targetHeight * targetWidth) + 
                          y * targetWidth + x;
            paddedData[dstIdx] = inputData[srcIdx];
          }
        }
      }
    }
    
    return new ort.Tensor('float16', paddedData, [batch, channels, targetHeight, targetWidth]);
  }

  /**
   * Extract a tile from the latent tensor
   */
  private extractTile(
    latent: ort.Tensor, 
    startX: number, 
    startY: number, 
    tileWidth: number, 
    tileHeight: number
  ): ort.Tensor {
    const [batch, channels, fullHeight, fullWidth] = latent.dims as [number, number, number, number];
    const inputData = latent.data as Float16Array;
    
    const tileData = new Float16Array(batch * channels * tileHeight * tileWidth);
    
    for (let b = 0; b < batch; b++) {
      for (let c = 0; c < channels; c++) {
        for (let y = 0; y < tileHeight; y++) {
          for (let x = 0; x < tileWidth; x++) {
            const srcIdx = b * (channels * fullHeight * fullWidth) + 
                          c * (fullHeight * fullWidth) + 
                          (startY + y) * fullWidth + 
                          (startX + x);
            const dstIdx = b * (channels * tileHeight * tileWidth) + 
                          c * (tileHeight * tileWidth) + 
                          y * tileWidth + x;
            tileData[dstIdx] = inputData[srcIdx];
          }
        }
      }
    }
    
    return new ort.Tensor('float16', tileData, [batch, channels, tileHeight, tileWidth]);
  }

  /**
   * Create a feather mask for smooth blending at tile edges
   */
  private createFeatherMask(
    width: number,
    height: number,
    overlapSize: number,
    isLeftEdge: boolean,
    isTopEdge: boolean,
    isRightEdge: boolean,
    isBottomEdge: boolean
  ): Float32Array {
    const mask = new Float32Array(width * height);
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        let weight = 1.0;
        
        // Apply feathering on edges that have overlap
        if (!isLeftEdge && x < overlapSize) {
          weight *= x / overlapSize; // Fade in from left
        }
        if (!isRightEdge && x >= width - overlapSize) {
          weight *= (width - 1 - x) / overlapSize; // Fade out to right
        }
        if (!isTopEdge && y < overlapSize) {
          weight *= y / overlapSize; // Fade in from top
        }
        if (!isBottomEdge && y >= height - overlapSize) {
          weight *= (height - 1 - y) / overlapSize; // Fade out to bottom
        }
        
        mask[y * width + x] = weight;
      }
    }
    
    return mask;
  }

  /**
   * Blend tile data into output tensor using feather weights
   */
  private blendTileToOutput(
    tileSample: ort.Tensor,
    outputTensor: ort.Tensor,
    weightTensor: ort.Tensor,
    featherMask: Float32Array,
    startX: number,
    startY: number,
    endX: number,
    endY: number,
    actualTileWidth: number,
    actualTileHeight: number
  ): void {
    const [tileBatch, tileChannels, tileHeight, tileWidth] = tileSample.dims as [number, number, number, number];
    const [, outputChannels, outputHeight, outputWidth] = outputTensor.dims as [number, number, number, number];
    
    const tileData = tileSample.data as Float32Array;
    const outputData = outputTensor.data as Float32Array;
    const weightData = weightTensor.data as Float32Array;
    
    const copyWidth = Math.min(actualTileWidth, endX - startX);
    const copyHeight = Math.min(actualTileHeight, endY - startY);
    
    for (let b = 0; b < tileBatch; b++) {
      for (let c = 0; c < tileChannels; c++) {
        for (let y = 0; y < copyHeight; y++) {
          for (let x = 0; x < copyWidth; x++) {
            const srcIdx = b * (tileChannels * tileHeight * tileWidth) + 
                          c * (tileHeight * tileWidth) + 
                          y * tileWidth + x;
            const dstIdx = b * (outputChannels * outputHeight * outputWidth) + 
                          c * (outputHeight * outputWidth) + 
                          (startY + y) * outputWidth + 
                          (startX + x);
            
            const maskIdx = y * actualTileWidth + x;
            const weight = featherMask[maskIdx];
            
            // Accumulate weighted pixel values
            outputData[dstIdx] += tileData[srcIdx] * weight;
            weightData[dstIdx] += weight;
          }
        }
      }
    }
  }

  /**
   * Normalize blended output by dividing by accumulated weights
   */
  private normalizeBlendedOutput(
    outputTensor: ort.Tensor,
    weightTensor: ort.Tensor
  ): void {
    const outputData = outputTensor.data as Float32Array;
    const weightData = weightTensor.data as Float32Array;
    
    for (let i = 0; i < outputData.length; i++) {
      if (weightData[i] > 0) {
        outputData[i] /= weightData[i];
      }
    }
  }

  /**
   * Get current scheduler name
   */
  getSchedulerName(): string {
    return this.scheduler.name;
  }

  /**
   * Create batched tensor for CFG inference (with performance tracking and pool usage)
   */
  private createBatchedTensor(tensor1: ort.Tensor, tensor2: ort.Tensor): ort.Tensor {
    const [, ...dims] = tensor1.dims;
    
    // Try to get a tensor from the pool
    const batchedTensor = this.tensorPool.getTensor('float16', [2, ...dims]);
    const batchedData = batchedTensor.data as Float16Array;
    
    // Copy first tensor data
    batchedData.set(tensor1.data as Float16Array, 0);
    // Copy second tensor data
    batchedData.set(tensor2.data as Float16Array, tensor1.data.length);
    
    this.performanceMonitor.recordTensorOp('reuse');
    return batchedTensor;
  }

  /**
   * Split batched tensor output back into individual tensors (optimized with tensor pool)
   */
  private splitBatchedTensor(batchedTensor: ort.Tensor): [ort.Tensor, ort.Tensor] {
    const [, ...dims] = batchedTensor.dims;
    const data = batchedTensor.data as Float16Array;
    const halfLength = data.length / 2;
    
    // Try to get tensors from pool
    const tensor1 = this.tensorPool.getTensor('float16', [1, ...dims]);
    const tensor2 = this.tensorPool.getTensor('float16', [1, ...dims]);
    
    const tensor1Data = tensor1.data as Float16Array;
    const tensor2Data = tensor2.data as Float16Array;
    
    tensor1Data.set(data.slice(0, halfLength));
    tensor2Data.set(data.slice(halfLength));
    
    this.performanceMonitor.recordTensorOp('reuse');
    this.performanceMonitor.recordTensorOp('reuse');
    
    return [tensor1, tensor2];
  }

  /**
   * Get all available scheduler types
   */
  static getAvailableSchedulers(): SchedulerType[] {
    return SchedulerRegistry.getAvailableSchedulers();
  }

  /**
   * Cancel the current generation process
   */
  cancelGeneration(): void {
    this.isCancelled = true;
  }

  /**
   * Reset cancellation flag
   */
  private resetCancellation(): void {
    this.isCancelled = false;
  }

  /**
   * Fetch and cache model files
   */
  private async fetchAndCache(url: string): Promise<ArrayBuffer> {
    try {
      const cache = await caches.open("onnx");
      let cachedResponse = await cache.match(url);
      if (cachedResponse === undefined) {
        await cache.add(url);
        cachedResponse = await cache.match(url);
        console.log(`${url} (network)`);
      } else {
        console.log(`${url} (cached)`);
      }
      if (cachedResponse) {
        return await cachedResponse.arrayBuffer();
      }
      throw new Error('Failed to cache response');
    } catch (error) {
      console.log(`${url} (network fallback)`);
      return await fetch(url).then(response => response.arrayBuffer());
    }
  }

  /**
   * Load text encoder and tokenizer (UNet and VAE loaded on-demand)
   */
  async loadModels(onProgress?: (stage: string, progress: number) => void): Promise<void> {
    if (this.isLoaded) return;

    try {
      if (onProgress) onProgress('Loading Text Encoder', 0.2);
      
      // Load text encoder (this one doesn't depend on resolution)
      const textEncoderBytes = await this.fetchAndCache(this.modelConfig.textEncoder.url);
      this.models.textEncoder = {
        sess: await ort.InferenceSession.create(textEncoderBytes, this.modelConfig.textEncoder.opt)
      };

      if (onProgress) onProgress('Loading Tokenizer', 0.4);
      
      // Load tokenizer
      await this.initializeTokenizer();

      if (onProgress) onProgress('Loading UNet for 512px', 0.6);
      
      // Load UNet and VAE for default 512px resolution
      const [latentHeight, latentWidth] = this.getLatentDimensions(512, 512);
      
      this.models.unet = {
        sess: await this.createUNetSession(latentHeight, latentWidth)
      };

      if (onProgress) onProgress('Loading VAE Decoder for 512px', 0.8);
      
      this.models.vaeDecoder = {
        sess: await this.createVAESession(latentHeight, latentWidth)
      };

      // Store current dimensions as 512px
      this.currentLatentDimensions = [latentHeight, latentWidth];

      this.isLoaded = true;
      if (onProgress) onProgress('Models Loaded', 1.0);
      
    } catch (error) {
      console.error('Failed to load models:', error);
      throw new Error(`Model loading failed: ${error}`);
    }
  }

  /**
   * Use Hugging Face tokenizer for text encoding
   */
  private async initializeTokenizer(): Promise<void> {
    this.tokenizer = await AutoTokenizer.from_pretrained('Xenova/clip-vit-base-patch16');
    this.tokenizer.pad_token_id = 0;
  }

  /**
   * Generate image from text prompt
   */
  async generateImage(
    options: TextToImageOptions,
    onProgress?: (stage: string, progress: number) => void
  ): Promise<ImageData> {
    const startTime = performance.now();
    this.performanceMonitor.startSession();
    
    if (!this.isLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    // Reset cancellation flag at the start
    this.resetCancellation();

    let { 
      prompt, 
      width = 512, 
      height = 512, 
      steps = 4, 
      guidance = 7.5, 
      seed, 
      scheduler = 'euler-karras',
      useTiledVAE = false,
      tileSize = 256 
    } = options;

    console.log(`Generating image with scheduler: ${scheduler}`);

    // Set scheduler if different from current
    if (scheduler !== this.scheduler.name.toLowerCase().replace(/\s+/g, '-')) {
      this.setScheduler(scheduler);
    }

    // Reset scheduler state (important for LMS scheduler which stores derivatives)
    if ('reset' in this.scheduler && typeof this.scheduler.reset === 'function') {
      (this.scheduler as any).reset();
    }

    // Clear tensor cache for new generation
    this.tensorCache = {};

    // Set seed for noise generation if provided
    if (seed !== undefined) {
      this.noiseGenerator.setSeed(seed);
    }

    try {
      const generationStartTime = performance.now();
      
      // Get negative prompt early to avoid variable issues
      const negativePromptText = options.negativePrompt || "";
      
      console.log(`🚀 Starting image generation:`, {
        resolution: `${width}x${height}`,
        steps,
        guidance,
        scheduler: scheduler,
        seed: seed || 'random',
        prompt: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        negativePrompt: negativePromptText ? negativePromptText.slice(0, 30) + '...' : 'none'
      });

      if (onProgress) onProgress('Encoding text prompt', 0.1);

      const textEncodingStart = performance.now();
      // Tokenize positive prompt
      const { input_ids: posInputIds } = await this.tokenizer!(prompt, { padding: true, max_length: 77, truncation: true, return_tensor: false });
      
      // Tokenize negative prompt (empty string for unconditional)
      const { input_ids: negInputIds } = await this.tokenizer!(negativePromptText, { padding: true, max_length: 77, truncation: true, return_tensor: false });

      // Run text encoder for positive prompt
      const posTextEncoderResult = await this.models.textEncoder!.sess.run({
        input_ids: new ort.Tensor('int32', posInputIds, [1, posInputIds.length])
      });

      // Run text encoder for negative prompt
      const negTextEncoderResult = await this.models.textEncoder!.sess.run({
        input_ids: new ort.Tensor('int32', negInputIds, [1, negInputIds.length])
      });

      const posEmbeddings = posTextEncoderResult.last_hidden_state as ort.Tensor;
      const negEmbeddings = negTextEncoderResult.last_hidden_state as ort.Tensor;
      
      const textEncodingTime = performance.now() - textEncodingStart;
      console.log(`📝 Text encoding completed in ${textEncodingTime.toFixed(2)}ms`);

      if (onProgress) onProgress('Generating initial noise', 0.2);

      // Generate random latents with correct dimensions for the target resolution
      const [latentHeight, latentWidth] = this.getLatentDimensions(width, height);
      const latentShape = [1, 4, latentHeight, latentWidth];
      const latentData = this.noiseGenerator.generateRandomLatents(latentShape, 1.0);
      let latent = new ort.Tensor('float16', latentData, latentShape);

      // Check if we need to recreate models for this resolution
      const needsNewModels = this.models.unet?.sess === undefined || 
                            this.models.vaeDecoder?.sess === undefined ||
                            this.currentLatentDimensions?.[0] !== latentHeight ||
                            this.currentLatentDimensions?.[1] !== latentWidth;

      if (needsNewModels) {
        if (onProgress) onProgress('Loading models for resolution', 0.25);
        
        // Dispose existing UNet and VAE sessions if they exist
        if (this.models.unet?.sess) {
          await this.models.unet.sess.release();
        }
        if (this.models.vaeDecoder?.sess) {
          await this.models.vaeDecoder.sess.release();
        }

        // Create new sessions with correct dimensions
        this.models.unet = {
          sess: await this.createUNetSession(latentHeight, latentWidth)
        };

        // Store current dimensions
        this.currentLatentDimensions = [latentHeight, latentWidth];
      }

      if (onProgress) onProgress('Running UNet denoising', 0.3);

      // Generate timesteps and sigmas using the scheduler
      const timestepData = this.scheduler.generateTimesteps(steps);
      
      console.log(`🔄 Starting denoising with ${steps} steps using ${this.scheduler.name} scheduler`);
      console.log(`📊 Latent dimensions: ${latentHeight}x${latentWidth} (${latentShape.join('x')})`);
      
      // Scale initial latents using scheduler
      latent = this.scheduler.scaleInitialNoise(latent, timestepData);
      
      const denoisingStartTime = performance.now();
      let totalUNetTime = 0;
      
      // Denoising loop
      for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
        // Check for cancellation
        if (this.isCancelled) {
          console.log(`❌ Generation cancelled at step ${stepIndex + 1}/${steps}`);
          if (onProgress) onProgress(`Cancelled at step ${stepIndex + 1}`, 0.7);
          break;
        }

        const stepStartTime = performance.now();
        const timestep = timestepData.timesteps[stepIndex];
        const sigma = timestepData.sigmas[stepIndex];
        const sigmaNext = timestepData.sigmas[stepIndex + 1];
        const progressBase = 0.3 + (stepIndex / steps) * 0.4; // 0.3 to 0.7
        
        if (onProgress) onProgress(`Denoising step ${stepIndex + 1}/${steps}`, progressBase);

        // Scale latents for model input using scheduler
        const latentModelInput = this.scheduler.scaleModelInputs(latent, stepIndex, sigma);

        // Convert timestep to float16 (cache and reuse the array)
        if (!this.tensorCache.timestepData) {
          this.tensorCache.timestepData = new Float16Array(1);
        }
        this.tensorCache.timestepData[0] = timestep;
        const timestepTensor = new ort.Tensor('float16', this.tensorCache.timestepData, [1]);

        let outSample: ort.Tensor;
        const unetStartTime = performance.now();

        if (guidance <= 1.0) {
          // No guidance - just run positive conditioning
          console.log(`  Step ${stepIndex + 1}: Running single UNet pass (no CFG), timestep=${timestep.toFixed(2)}, sigma=${sigma.toFixed(4)}`);
          
          const unetResult = await this.models.unet!.sess.run({
            sample: latentModelInput,
            timestep: timestepTensor,
            encoder_hidden_states: posEmbeddings
          });
          outSample = unetResult.out_sample as ort.Tensor;
        } else {
          // Run UNet with batched CFG for better performance
          this.performanceMonitor.startStage('unet_inference');
          console.log(`  Step ${stepIndex + 1}: Running batched CFG with guidance=${guidance}, timestep=${timestep.toFixed(2)}, sigma=${sigma.toFixed(4)}`);
          
          // Create batched inputs (negative first, then positive)
          const batchedSample = this.createBatchedTensor(latentModelInput, latentModelInput);
          const batchedEmbeddings = this.createBatchedTensor(negEmbeddings, posEmbeddings);
          
          // Create batched timestep tensor (cache and reuse the array)
          if (!this.tensorCache.batchedTimestepData) {
            this.tensorCache.batchedTimestepData = new Float16Array(2);
          }
          this.tensorCache.batchedTimestepData[0] = this.tensorCache.timestepData![0];
          this.tensorCache.batchedTimestepData[1] = this.tensorCache.timestepData![0];
          const batchedTimestepTensor = new ort.Tensor('float16', this.tensorCache.batchedTimestepData, [2]);
          
          // Single batched UNet call instead of two separate calls
          const batchedUnetResult = await this.models.unet!.sess.run({
            sample: batchedSample,
            timestep: batchedTimestepTensor,
            encoder_hidden_states: batchedEmbeddings
          });
          this.performanceMonitor.endStage();
          
          const batchedOutput = batchedUnetResult.out_sample as ort.Tensor;
          
          // Split the batched output back into negative and positive
          const [negOutput, posOutput] = this.splitBatchedTensor(batchedOutput);
          
          // Apply classifier-free guidance (cache and reuse the output array)
          const negData = negOutput.data as Float16Array;
          const posData = posOutput.data as Float16Array;
          
          if (!this.tensorCache.guidedOutputData || this.tensorCache.guidedOutputData.length !== negData.length) {
            this.tensorCache.guidedOutputData = new Float16Array(negData.length);
          }
          const guidedOutputData = this.tensorCache.guidedOutputData;
          
          // Optimized CFG calculation
          for (let i = 0; i < negData.length; i++) {
            // CFG formula: negative + guidance * (positive - negative)
            guidedOutputData[i] = negData[i] + guidance * (posData[i] - negData[i]);
          }
          
          outSample = new ort.Tensor('float16', guidedOutputData, latentModelInput.dims);
          
          // Dispose intermediate tensors to free memory for pool reuse
          this.disposeTensor(batchedSample);
          this.disposeTensor(batchedEmbeddings);
          this.disposeTensor(batchedTimestepTensor);
          this.disposeTensor(batchedOutput);
          this.disposeTensor(negOutput);
          this.disposeTensor(posOutput);
        }

        const unetTime = performance.now() - unetStartTime;
        totalUNetTime += unetTime;

        // Apply scheduler step
        const stepResult = this.scheduler.step(outSample, latent, stepIndex, sigma, sigmaNext);
        
        // Dispose the previous latent tensor and UNet output
        if (stepIndex > 0) { // Don't dispose the initial latent
          this.disposeTensor(latent);
        }
        this.disposeTensor(outSample); // Dispose UNet output
        
        latent = stepResult.prevSample;
        this.performanceMonitor.recordTensorOp('create', latent.size * 2); // Track new latent
        
        const stepTime = performance.now() - stepStartTime;
        console.log(`  ⏱️  Step ${stepIndex + 1} completed in ${stepTime.toFixed(2)}ms (UNet: ${unetTime.toFixed(2)}ms)`);
      }
      
      const totalDenoisingTime = performance.now() - denoisingStartTime;
      console.log(`✅ Denoising completed in ${totalDenoisingTime.toFixed(2)}ms (avg: ${(totalDenoisingTime / steps).toFixed(2)}ms/step, UNet total: ${totalUNetTime.toFixed(2)}ms)`);

      // Apply VAE scaling factor after denoising is complete
      if (onProgress) onProgress('Applying VAE scaling', 0.75);
      const vaeScaledData = new Float16Array(latent.data.length);
      for (let i = 0; i < latent.data.length; i++) {
        vaeScaledData[i] = (latent.data as Float16Array)[i] / this.vaeScalingFactor;
      }
      latent = new ort.Tensor('float16', vaeScaledData, latent.dims);

      if (onProgress) onProgress('Decoding with VAE', 0.8);

      // Run VAE decoder (tiled or regular)
      this.performanceMonitor.startStage('vae_decode');
      const vaeStartTime = performance.now();
      let sample: ort.Tensor;
      
      if (useTiledVAE) {
        // Use tiled VAE decoding to reduce memory usage
        console.log(`🧩 Using tiled VAE decoding with tile size: ${tileSize}px`);
        sample = await this.decodeTiledVAE(latent, width, height, tileSize, onProgress);
      } else {
        // Regular VAE decoding
        // Load regular VAE
        const vaeSession = await this.createVAESession(latent.dims[2], latent.dims[3]);

        const vaeResult = await vaeSession.run({
          latent_sample: latent
        });
        sample = vaeResult.sample as ort.Tensor;
      }
      
      this.performanceMonitor.endStage();
      const vaeTime = performance.now() - vaeStartTime;
      console.log(`🎨 VAE decoding completed in ${vaeTime.toFixed(2)}ms`);

      if (onProgress) onProgress('Converting to image', 0.9);

      // Convert tensor to ImageData (with performance monitoring)
      this.performanceMonitor.startStage('tensor_to_image');
      const conversionStartTime = performance.now();
      const imageData = this.tensorToImageData(sample, width, height);
      const conversionTime = performance.now() - conversionStartTime;
      this.performanceMonitor.endStage();
      
      // Generate performance report
      const metrics = this.performanceMonitor.endSession();
      const totalGenerationTime = performance.now() - startTime;
      
      console.log(`🖼️  Image conversion completed in ${conversionTime.toFixed(2)}ms`);
      console.log(`🎉 Total generation completed in ${totalGenerationTime.toFixed(2)}ms`);
      console.log(`📊 Tensor Pool Stats:`, this.tensorPool.getStats());
      console.log(this.performanceMonitor.generateReport(metrics));
      
      const suggestions = this.performanceMonitor.getOptimizationSuggestions(metrics);
      if (suggestions.length > 0) {
        console.log(`💡 Optimization Suggestions:`, suggestions);
      }
      console.log(`📈 Performance breakdown:`, {
        textEncoding: `${textEncodingTime.toFixed(2)}ms`,
        denoising: `${totalDenoisingTime.toFixed(2)}ms`,
        vaeDecoding: `${vaeTime.toFixed(2)}ms`,
        imageConversion: `${conversionTime.toFixed(2)}ms`,
        total: `${totalGenerationTime.toFixed(2)}ms`
      });

      // Clean up GPU resources
      try {
        if ('dispose' in posEmbeddings && typeof posEmbeddings.dispose === 'function') {
          posEmbeddings.dispose();
        }
        if ('dispose' in negEmbeddings && typeof negEmbeddings.dispose === 'function') {
          negEmbeddings.dispose();
        }
      } catch (error) {
        // Ignore disposal errors
      }
      
      // Dispose the final sample tensor after conversion
      this.disposeTensor(sample);

      if (onProgress) onProgress('Generation complete', 1.0);
      return imageData;

    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error(`Generation failed: ${error}`);
    }
  }

  /**
   * Convert tensor to ImageData (optimized with SIMD operations)
   */
  private tensorToImageData(tensor: ort.Tensor, width: number, height: number): ImageData {
    let pixelData = tensor.data as Float16Array;
    
    // Use optimized normalization
    const normalizedData = new Float32Array(pixelData.length);
    const float32Data = new Float32Array(pixelData.length);
    
    // Convert Float16 to Float32 for processing
    for (let i = 0; i < pixelData.length; i++) {
      float32Data[i] = pixelData[i];
    }
    
    // Use optimized SIMD normalization
    OptimizedTensorOps.normalizeTensor(float32Data, normalizedData, -1, 1);

    // Create ImageData using ONNX tensor's toImageData if available
    try {
      const optimizedTensor = new ort.Tensor('float32', normalizedData, tensor.dims);
      if ('toImageData' in optimizedTensor && typeof optimizedTensor.toImageData === 'function') {
        const result = optimizedTensor.toImageData({ tensorLayout: 'NCHW', format: 'RGB' });
        this.performanceMonitor.recordTensorOp('reuse');
        return result;
      }
    } catch (error) {
      console.warn('toImageData not available, using optimized manual conversion');
    }

    // Optimized manual conversion with unrolled loops
    const imageData = new ImageData(width, height);
    const pixels = imageData.data;

    // Process 4 pixels at a time for better vectorization
    const totalPixels = width * height;
    let pixelIdx = 0;
    
    for (let i = 0; i < totalPixels; i++) {
      const tensorIdx = i;
      
      // RGB channels (NCHW format: [N, C, H, W])
      const r = Math.round(normalizedData[tensorIdx] * 255);
      const g = Math.round(normalizedData[width * height + tensorIdx] * 255);
      const b = Math.round(normalizedData[2 * width * height + tensorIdx] * 255);

      pixels[pixelIdx] = Math.max(0, Math.min(255, r));     // R
      pixels[pixelIdx + 1] = Math.max(0, Math.min(255, g)); // G
      pixels[pixelIdx + 2] = Math.max(0, Math.min(255, b)); // B
      pixels[pixelIdx + 3] = 255;                           // A
      
      pixelIdx += 4;
    }

    this.performanceMonitor.recordTensorOp('create', normalizedData.length * 4);
    return imageData;
  }

  /**
   * Check if models are loaded
   */
  get modelsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Dispose of all models and free memory
   */
  async dispose(): Promise<void> {
    if (this.models.textEncoder?.sess) {
      await this.models.textEncoder.sess.release();
    }
    if (this.models.unet?.sess) {
      await this.models.unet.sess.release();
    }
    if (this.models.vaeDecoder?.sess) {
      await this.models.vaeDecoder.sess.release();
    }
    
    this.models = {};
    this.isLoaded = false;
    this.currentLatentDimensions = null;
  }
}
