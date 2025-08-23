import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler, SchedulerRegistry } from './schedulers';
import type { SchedulerType } from './schedulers';
import { NoiseGenerator } from './utils/noiseGenerator';
import { PerformanceMonitor } from './utils/performanceMonitor';
import { LatentPreview } from './utils/latentPreview';
import { ModelManager, TensorOperations, VAEProcessor, TiledVAEProcessor } from './core';

export interface TextToImageOptions {
  prompt: string;
  negativePrompt?: string;
  width: number;
  height: number;
  steps: number;
  guidance: number;
  seed: number;
  scheduler?: SchedulerType;
  useTiledVAE?: boolean;  // Use tiled VAE to reduce memory usage
  lowMemoryMode?: boolean; // Enable low memory mode (unloads unet when decoding)
  tileSize?: number;      // Size of tiles (defaults to 512)
}

export class TextToImageGenerator {
  private scheduler: BaseScheduler;
  private noiseGenerator: NoiseGenerator;
  private performanceMonitor = PerformanceMonitor.getInstance();
  private isCancelled: boolean = false;

  // Core processors
  private modelManager: ModelManager;
  private tensorOps: TensorOperations;
  private vaeProcessor: VAEProcessor;
  private tiledVaeProcessor: TiledVAEProcessor;

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

    // Initialize core processors
    this.modelManager = new ModelManager();
    this.tensorOps = new TensorOperations();
    this.vaeProcessor = new VAEProcessor();
    this.tiledVaeProcessor = new TiledVAEProcessor(this.modelManager);
  }

  /**
   * Set the scheduler type
   */
  setScheduler(schedulerType: SchedulerType): void {
    this.scheduler = SchedulerRegistry.createScheduler(schedulerType);
  }

  /**
   * Get current scheduler name
   */
  getSchedulerName(): string {
    return this.scheduler.name;
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
   * Load models
   */
  async loadModels(onProgress: (stage: string, progress: number) => void, resolution: { height: number; width: number }): Promise<void> {
    return this.modelManager.loadModels(onProgress, resolution);
  }

  /**
   * Generate image from text prompt
   */
  async generateImage(
    options: TextToImageOptions,
    onProgress?: (stage: string, progress: number) => void,
    onPreview?: (previewImageData: ImageData) => void
  ): Promise<ImageData> {
    const startTime = performance.now();
    this.performanceMonitor.startSession();

    if (!this.modelManager.modelsLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    // Reset cancellation flag at the start
    this.resetCancellation();

    let {
      prompt,
      height = 512,
      width = 512,
      steps = 4,
      guidance = 7.5,
      seed,
      scheduler = 'euler-karras',
      useTiledVAE = false,
      tileSize = 256,
      lowMemoryMode = true
    } = options;
    
    this.setScheduler(scheduler);

    // Reset scheduler state (important for LMS scheduler which stores derivatives)
    this.scheduler.reset();

    // Clear tensor cache for new generation
    this.tensorCache = {};

    // Handle seed generation and setting
    this.noiseGenerator.setSeed(seed);

    try {
      const negativePromptText = options.negativePrompt || "";
      console.log(`🚀 Starting image generation:`, {
        resolution: `${width}x${height}`,
        steps,
        guidance,
        scheduler: scheduler,
        seed: seed,
        prompt: prompt.slice(0, 50) + (prompt.length > 50 ? '...' : ''),
        negativePrompt: negativePromptText ? negativePromptText.slice(0, 30) + '...' : 'none'
      });

      if (onProgress) onProgress('Encoding text prompt', 0.1);

      const tokenizer = this.modelManager.getTokenizer();
      if (!tokenizer) {
        throw new Error('Tokenizer not loaded');
      }

      // Tokenize positive prompt
      const { input_ids: posInputIds } = await tokenizer(prompt, { padding: true, max_length: 77, truncation: true, return_tensor: false });

      // Tokenize negative prompt (empty string for unconditional)
      const { input_ids: negInputIds } = await tokenizer(negativePromptText, { padding: true, max_length: 77, truncation: true, return_tensor: false });

      const models = this.modelManager.getModels();
      if (!models.textEncoder) {
        throw new Error('Text encoder not loaded');
      }

      // Run text encoder for positive prompt
      const {last_hidden_state: posEmbeddings} = await models.textEncoder.sess.run({
        input_ids: new ort.Tensor('int32', posInputIds, [1, posInputIds.length])
      });

      // Run text encoder for negative prompt
      const {last_hidden_state: negEmbeddings} = await models.textEncoder.sess.run({
        input_ids: new ort.Tensor('int32', negInputIds, [1, negInputIds.length])
      });

      if (onProgress) onProgress('Generating initial noise', 0.2);

      // Generate random latents with correct dimensions for the target resolution
      const [latentHeight, latentWidth] = this.modelManager.getLatentDimensions(height, width);
      const latentShape = [1, 4, latentHeight, latentWidth];
      const latentData = this.noiseGenerator.generateRandomLatents(latentShape, 1.0);
      let latent = new ort.Tensor('float16', latentData, latentShape);

      // Check if we need to recreate models for this resolution
      const needsNewModels = this.modelManager.needsNewModels(latentHeight, latentWidth);

      if (needsNewModels || !models.unet) {
        if (onProgress) onProgress('Loading models for resolution', 0.25);
        await this.modelManager.reload(latentHeight, latentWidth, onProgress);
      }


      if (onProgress) onProgress('Running UNet denoising', 0.3);

      // Generate timesteps and sigmas using the scheduler
      const timestepData = this.scheduler.generateTimesteps(steps);

      console.log(`🔄 Starting denoising with ${steps} steps using ${this.scheduler.name} scheduler`);
      console.log(`📊 Latent dimensions: ${latentHeight}x${latentWidth} (${latentShape.join('x')})`);

      // Scale initial latents depending on the scheduler
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

        let outSample: ort.Tensor;
        const unetStartTime = performance.now();

        // Run UNet with batched CFG for better performance
        this.performanceMonitor.startStage('unet_inference');
        console.log(`  Step ${stepIndex + 1}: Running batched CFG with guidance=${guidance}, timestep=${timestep.toFixed(2)}, sigma=${sigma.toFixed(4)}`);

        // Create batched inputs (negative first, then positive)
        const batchedSample = this.tensorOps.createBatchedTensor(latentModelInput, latentModelInput);
        const batchedEmbeddings = this.tensorOps.createBatchedTensor(negEmbeddings, posEmbeddings);

        // Convert timestep to float16 (cache and reuse the array)
        if (!this.tensorCache.timestepData) {
          this.tensorCache.timestepData = new Float16Array(1);
        }
        this.tensorCache.timestepData[0] = timestep;

        // Create batched timestep tensor (cache and reuse the array)
        if (!this.tensorCache.batchedTimestepData) {
          this.tensorCache.batchedTimestepData = new Float16Array(2);
        }
        this.tensorCache.batchedTimestepData[0] = this.tensorCache.timestepData![0];
        this.tensorCache.batchedTimestepData[1] = this.tensorCache.timestepData![0];
        const batchedTimestepTensor = new ort.Tensor('float16', this.tensorCache.batchedTimestepData, [2]);

        if (!models.unet) {
          throw new Error('UNet not loaded');
        }

        // Single batched UNet call instead of two separate calls
        let batchedUnetResult: Record<string, ort.Tensor>;
        try{
          batchedUnetResult = await models.unet.sess.run({
            sample: batchedSample,
            timestep: batchedTimestepTensor,
            encoder_hidden_states: batchedEmbeddings
          });
        }catch(error){
          console.error('Error occurred during UNet inference:', error);
          throw error;
        }
        this.performanceMonitor.endStage();

        const batchedOutput = batchedUnetResult.out_sample as ort.Tensor;

        // Split the batched output back into negative and positive
        const [negOutput, posOutput] = this.tensorOps.splitBatchedTensor(batchedOutput);

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
        this.tensorOps.disposeTensor(batchedSample);
        this.tensorOps.disposeTensor(batchedEmbeddings);
        this.tensorOps.disposeTensor(batchedTimestepTensor);
        this.tensorOps.disposeTensor(batchedOutput);
        this.tensorOps.disposeTensor(negOutput);
        this.tensorOps.disposeTensor(posOutput);
      
        const unetTime = performance.now() - unetStartTime;
        totalUNetTime += unetTime;

        // Apply scheduler step
        const stepResult = this.scheduler.step(outSample, latent, stepIndex, sigma, sigmaNext);

        // Dispose the previous latent tensor and UNet output
        if (stepIndex > 0) { // Don't dispose the initial latent because it will be reused
          this.tensorOps.disposeTensor(latent);
        }
        this.tensorOps.disposeTensor(outSample); // Dispose UNet output

        latent = stepResult.prevSample;
        this.performanceMonitor.recordTensorOp('create', latent.size * 2); // Track new latent

        // Generate preview if callback is provided
        if (onPreview) {
          try {
            const previewImageData = LatentPreview.latentToRGBAdvanced(latent, width, height);
            onPreview(previewImageData);
          } catch (error) {
            console.warn('Preview generation failed:', error);
          }
        }

        const stepTime = performance.now() - stepStartTime;
        console.log(`  ⏱️  Step ${stepIndex + 1} completed in ${stepTime.toFixed(2)}ms (UNet: ${unetTime.toFixed(2)}ms)`);
      }

      const totalDenoisingTime = performance.now() - denoisingStartTime;
      console.log(`✅ Denoising completed in ${totalDenoisingTime.toFixed(2)}ms (avg: ${(totalDenoisingTime / steps).toFixed(2)}ms/step, UNet total: ${totalUNetTime.toFixed(2)}ms)`);

      if (lowMemoryMode) {
        // Unload unet to save memory
        models.unet?.sess.release();
        models.unet = undefined;
      }

      // Apply VAE scaling factor after denoising is complete
      if (onProgress) onProgress('Applying VAE scaling', 0.75);
      latent = this.vaeProcessor.applyVAEScaling(latent);

      if (onProgress) onProgress('Decoding with VAE', 0.8);

      // Run VAE decoder (tiled or regular)
      this.performanceMonitor.startStage('vae_decode');
      const vaeStartTime = performance.now();
      let sample: ort.Tensor;

      if (useTiledVAE) {
        // Use tiled VAE decoding to reduce memory usage
        console.log(`🧩 Using tiled VAE decoding with tile size: ${tileSize}px`);
        sample = await this.tiledVaeProcessor.decodeTiledVAE(latent, width, height, tileSize, onProgress);
      } else {
        // Regular VAE decoding
        const vaeSession = await this.modelManager.createVAESession(latent.dims[2], latent.dims[3], onProgress);

        const vaeResult = await vaeSession.run({
          latent_sample: latent
        });
        sample = vaeResult.sample as ort.Tensor;

        vaeSession.release(); // Dispose session after use
      }

      this.performanceMonitor.endStage();
      const vaeTime = performance.now() - vaeStartTime;
      console.log(`🎨 VAE decoding completed in ${vaeTime.toFixed(2)}ms`);

      if (onProgress) onProgress('Converting to image', 0.9);

      // Convert tensor to ImageData (with performance monitoring)
      this.performanceMonitor.startStage('tensor_to_image');
      const conversionStartTime = performance.now();
      const imageData = this.vaeProcessor.tensorToImageData(sample);
      const conversionTime = performance.now() - conversionStartTime;
      this.performanceMonitor.endStage();

      // Generate performance report
      const metrics = this.performanceMonitor.endSession();
      const totalGenerationTime = performance.now() - startTime;

      console.log(`🖼️  Image conversion completed in ${conversionTime.toFixed(2)}ms`);
      console.log(`🎉 Total generation completed in ${totalGenerationTime.toFixed(2)}ms`);
      console.log(this.performanceMonitor.generateReport(metrics));


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
      this.tensorOps.disposeTensor(sample);

      if (onProgress) onProgress('Generation complete', 1.0);
      return imageData;

    } catch (error) {
      console.error('Image generation failed:', error);
      onProgress?.('Error', 1.0);
      throw error;
    }
  }

  /**
   * Check if models are loaded
   */
  get modelsLoaded(): boolean {
    return this.modelManager.modelsLoaded;
  }

  /**
   * Dispose of all models and free memory
   */
  async dispose(): Promise<void> {
    await this.modelManager.dispose();
  }
}
