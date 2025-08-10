import * as ort from 'onnxruntime-web/webgpu';
import { AutoTokenizer, env, PreTrainedTokenizer } from '@xenova/transformers';

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
}


const urls = {
  "unet": "/models/unet.onnx",
  "textEncoder": "/models/text_encoder.onnx",
  "vaeDecoder": "/models/vae_decoder.onnx"
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

  // Model configuration
  private readonly modelConfig: {
    textEncoder: {
      url: string;
      opt: any;
    };
    unet: {
      url: string;
      weightsUrl?: string;
      opt: any;
    };
    vaeDecoder: {
      url: string;
      opt: any;
    };
  } = {
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
      weightsUrl: "/models/weights.pb", // Separate weights file
      opt: { 
        externalData: [
        {
            path: './weights.pb',
            data: "/models/weights.pb"
        }
      ],
        freeDimensionOverrides: { 
          batch_size: 1, 
          num_channels: 4, 
          height: 64, // Default for 512x512 images
          width: 64, 
          sequence_length: 77 
        },
        executionProviders: ['webgpu'],
        enableMemPattern: false,
        enableCpuMemArena: false,
        graphOptimizationLevel: 'basic', // Reduce optimization to save memory
        extra: {
          session: {
            disable_prepacking: "1",
            use_device_allocator_for_initializers: "1",
            use_ort_model_bytes_directly: "1",
            use_ort_model_bytes_for_initializers: "1",
            memory_limit: "2147483648" // 2GB limit
          }
        }
      }
    },
    vaeDecoder: {
      url: urls.vaeDecoder,
      opt: { 
        freeDimensionOverrides: { 
          batch_size: 1, 
          num_channels_latent: 4, 
          height_latent: 64, // Default for 512x512 images
          width_latent: 64 
        },
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

  constructor() {
    // Configure ONNX Runtime
    ort.env.wasm.wasmPaths = 'https://cdn.jsdelivr.net/npm/onnxruntime-web@1.22.0/dist/';
    ort.env.wasm.numThreads = 1;
    ort.env.logLevel = 'warning';

    // Check WebGPU support
    if (!('gpu' in navigator)) {
    // if (true){
      console.warn('WebGPU not supported, falling back to WASM');
      // Fallback to WASM for all models
      Object.values(this.modelConfig).forEach(config => {
        config.opt.executionProviders = ['wasm'];
      });
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
   * Generate random latents with proper distribution
   */
  private generateRandomLatents(shape: number[], noiseSigma: number, seed?: number): Float16Array {
    // Set seed if provided
    if (seed !== undefined) {
      Math.random = this.seededRandom(seed);
    }

    function randn() {
      // Box-Muller transform for normal distribution
      let u = Math.random();
      let v = Math.random();
      let z = Math.sqrt(-2 * Math.log(u)) * Math.cos(2 * Math.PI * v);
      return z;
    }

    let size = 1;
    shape.forEach(element => {
      size *= element;
    });

    let data = new Float16Array(size);
    for (let i = 0; i < size; i++) {
      data[i] = randn() * noiseSigma;
    }
    return data;
  }

  /**
   * Simple seedable random number generator
   */
  private seededRandom(seed: number) {
    return function() {
      seed = Math.sin(seed) * 10000;
      return seed - Math.floor(seed);
    };
  }
  
  /**
   * Generate timesteps for Euler-Karras scheduler
   */
  private generateKarrasTimesteps(steps: number): { timesteps: number[], sigmas: number[] } {
    // Karras noise schedule parameters
    const sigmaMin = 0.0292;
    const sigmaMax = 14.6146;
    const rho = 7.0;
    
    const timesteps: number[] = [];
    const sigmas: number[] = [];
    
    // Generate karras sigmas using proper exponential schedule
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const minInvRho = sigmaMin ** (1 / rho);
      const maxInvRho = sigmaMax ** (1 / rho);
      const sigma = (maxInvRho + t * (minInvRho - maxInvRho)) ** rho;
      sigmas.push(sigma);
      
      // Convert sigma to timestep using proper formula
      // timestep = 1000 * sigma / sigmaMax
      const timestep = 1000 * sigma / sigmaMax;
      timesteps.push(timestep);
    }
    
    // Add final sigma of 0
    sigmas.push(0);
    
    return { timesteps, sigmas };
  }

  /**
   * Scale model inputs according to Euler-Karras scheduler
   */
  private scaleModelInputs(tensor: ort.Tensor, sigma: number): ort.Tensor {
    const inputData = tensor.data as Float16Array;
    const outputData = new Float16Array(inputData.length);
    
    // Scale input by sigma for Euler-Karras
    const scaleFactor = 1.0 / Math.sqrt(sigma ** 2 + 1);
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * scaleFactor;
    }
    
    return new ort.Tensor('float16', outputData, tensor.dims);
  }

  /**
   * Perform Euler-Karras scheduler step
   */
  private eulerKarrasStep(
    modelOutput: ort.Tensor, 
    sample: ort.Tensor, 
    sigma: number, 
    sigmaNext: number
  ): ort.Tensor {
    const outputData = new Float16Array(modelOutput.data.length);
    
    // For diffusion models, the model output is the predicted noise
    // We need to compute the derivative properly
    const dt = sigmaNext - sigma;
    
    for (let i = 0; i < modelOutput.data.length; i++) {
      // Compute the derivative: d_x = (x - sigma * eps) / sigma
      // where eps is the predicted noise (model output)
      const x = (sample.data as Float16Array)[i];
      const eps = (modelOutput.data as Float16Array)[i];
      
      // Predict original sample
      const predOrigSample = x - sigma * eps;
      
      // Compute derivative for Euler step
      const derivative = (x - predOrigSample) / sigma;
      
      // Apply Euler step: x_new = x + derivative * dt
      outputData[i] = x + derivative * dt;
    }

    return new ort.Tensor('float16', outputData, modelOutput.dims);
  }

  /**
   * Fetch and cache model files
   */
  private async fetchAndCache(url: string): Promise<ArrayBuffer> {
    try {
      const cache = await caches.open("onnx-models");
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
   * Create UNet session with specific dimensions
   */
  private async createUNetSession(latentHeight: number, latentWidth: number): Promise<ort.InferenceSession> {
    const unetBytes = await this.fetchAndCache(this.modelConfig.unet.url);
    let weightsBytes = new ArrayBuffer(0);
    
    if (this.modelConfig.unet.weightsUrl) {
      weightsBytes = await this.fetchAndCache(this.modelConfig.unet.weightsUrl);
    }

    const unetOptions = {
      ...this.modelConfig.unet.opt,
      freeDimensionOverrides: {
        batch_size: 1, 
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
      ...this.modelConfig.vaeDecoder.opt,
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
   * Load all models required for generation
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

      if (onProgress) onProgress('Loading Tokenizer', 0.8);
      
      // Load tokenizer (using a simple implementation for now)
      await this.initializeTokenizer();

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
    if (!this.isLoaded) {
      throw new Error('Models not loaded. Call loadModels() first.');
    }

    let { prompt, width = 512, height = 512, steps = 4, guidance = 7.5, seed } = options;

    try {      
      if (onProgress) onProgress('Encoding text prompt', 0.1);

      // Tokenize positive prompt
      const { input_ids: posInputIds } = await this.tokenizer!(prompt, { padding: true, max_length: 77, truncation: true, return_tensor: false });
      
      // Tokenize negative prompt (empty string for unconditional)
      const negativePrompt = options.negativePrompt || "";
      const { input_ids: negInputIds } = await this.tokenizer!(negativePrompt, { padding: true, max_length: 77, truncation: true, return_tensor: false });

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

      if (onProgress) onProgress('Generating initial noise', 0.2);

      // Generate random latents with correct dimensions for the target resolution
      const [latentHeight, latentWidth] = this.getLatentDimensions(width, height);
      const latentShape = [1, 4, latentHeight, latentWidth];
      const latentData = this.generateRandomLatents(latentShape, 1.0, seed);
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
        this.models.vaeDecoder = {
          sess: await this.createVAESession(latentHeight, latentWidth)
        };

        // Store current dimensions
        this.currentLatentDimensions = [latentHeight, latentWidth];
      }

      if (onProgress) onProgress('Running UNet denoising', 0.3);

      // Generate Karras timesteps and sigmas
      const { timesteps, sigmas } = this.generateKarrasTimesteps(steps);
      
      // Scale initial latents by first sigma
      const initialSigma = sigmas[0];
      const scaledLatentData = new Float16Array(latent.data.length);
      for (let i = 0; i < latent.data.length; i++) {
        scaledLatentData[i] = (latent.data as Float16Array)[i] * initialSigma;
      }
      latent = new ort.Tensor('float16', scaledLatentData, latent.dims);
      
      // Denoising loop
      for (let stepIndex = 0; stepIndex < steps; stepIndex++) {
        const timestep = timesteps[stepIndex];
        const sigma = sigmas[stepIndex];
        const sigmaNext = sigmas[stepIndex + 1];
        const progressBase = 0.3 + (stepIndex / steps) * 0.4; // 0.3 to 0.7
        
        if (onProgress) onProgress(`Denoising step ${stepIndex + 1}/${steps}`, progressBase);

        // Scale latents for model input
        const latentModelInput = this.scaleModelInputs(latent, sigma);

        // Convert timestep to float16
        const timestepFloat16 = new Float16Array([timestep]);
        const timestepTensor = new ort.Tensor('float16', timestepFloat16, [1]);

        let outSample: ort.Tensor;

        if (guidance <= 1.0) {
          // No guidance - just run positive conditioning
          const unetResult = await this.models.unet!.sess.run({
            sample: latentModelInput,
            timestep: timestepTensor,
            encoder_hidden_states: posEmbeddings
          });
          outSample = unetResult.out_sample as ort.Tensor;
        } else {
          // Run UNet twice for classifier-free guidance (memory efficient)
          // First run: negative/unconditional
          const negUnetResult = await this.models.unet!.sess.run({
            sample: latentModelInput,
            timestep: timestepTensor,
            encoder_hidden_states: negEmbeddings
          });

          const negOutput = negUnetResult.out_sample as ort.Tensor;

          // Second run: positive/conditional
          const posUnetResult = await this.models.unet!.sess.run({
            sample: latentModelInput,
            timestep: timestepTensor,
            encoder_hidden_states: posEmbeddings
          });

          const posOutput = posUnetResult.out_sample as ort.Tensor;
          
          // Apply classifier-free guidance
          const negData = negOutput.data as Float16Array;
          const posData = posOutput.data as Float16Array;
          const guidedOutputData = new Float16Array(negData.length);
          
          for (let i = 0; i < negData.length; i++) {
            // CFG formula: negative + guidance * (positive - negative)
            guidedOutputData[i] = negData[i] + guidance * (posData[i] - negData[i]);
          }
          
          outSample = new ort.Tensor('float16', guidedOutputData, latentModelInput.dims);
        }
        
        // Debug: Log some values to check if denoising is working
        if (stepIndex === 0) {
          console.log('Step ' + (stepIndex + 1) + ': sigma=' + sigma.toFixed(4) + ', sigmaNext=' + sigmaNext.toFixed(4));
          const sampleData = latent.data as Float16Array;
          const outputData = outSample.data as Float16Array;
          console.log('Sample range: ' + Math.min(...sampleData).toFixed(4) + ' to ' + Math.max(...sampleData).toFixed(4));
          console.log('Model output range: ' + Math.min(...outputData).toFixed(4) + ' to ' + Math.max(...outputData).toFixed(4));
        }

        // Apply Euler-Karras step
        latent = this.eulerKarrasStep(outSample, latent, sigma, sigmaNext);
      }

      // Apply VAE scaling factor after denoising is complete
      if (onProgress) onProgress('Applying VAE scaling', 0.75);
      const vaeScaledData = new Float16Array(latent.data.length);
      for (let i = 0; i < latent.data.length; i++) {
        vaeScaledData[i] = (latent.data as Float16Array)[i] / this.vaeScalingFactor;
      }
      latent = new ort.Tensor('float16', vaeScaledData, latent.dims);

      // Free UNet model to save GPU memory before VAE decode
      // if (onProgress) onProgress('Freeing UNet memory', 0.75);
      // if (this.models.unet?.sess) {
      //   await this.models.unet.sess.release();
      //   this.models.unet = undefined;
      //   console.log('UNet model unloaded to free GPU memory');
      // }

      if (onProgress) onProgress('Decoding with VAE', 0.8);

      // Run VAE decoder
      const vaeResult = await this.models.vaeDecoder!.sess.run({
        latent_sample: latent
      });

      const sample = vaeResult.sample as ort.Tensor;

      if (onProgress) onProgress('Converting to image', 0.9);

      // Convert tensor to ImageData
      const imageData = this.tensorToImageData(sample, width, height);

      // Clean up GPU resources (WebGPU specific)
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

      if (onProgress) onProgress('Generation complete', 1.0);
      return imageData;

    } catch (error) {
      console.error('Image generation failed:', error);
      throw new Error(`Generation failed: ${error}`);
    }
  }

  /**
   * Convert tensor to ImageData
   */
  private tensorToImageData(tensor: ort.Tensor, width: number, height: number): ImageData {
    let pixelData = tensor.data as Float16Array;
    
    // Normalize pixel values from [-1, 1] to [0, 1]
    const normalizedData = new Float16Array(pixelData.length);
    for (let i = 0; i < pixelData.length; i++) {
      let x = pixelData[i];
      x = x / 2 + 0.5;
      if (x < 0) x = 0;
      if (x > 1) x = 1;
      normalizedData[i] = x;
    }

    // Create ImageData using ONNX tensor's toImageData if available (WebGPU specific)
    try {
      const normalizedTensor = new ort.Tensor('float16', normalizedData, tensor.dims);
      if ('toImageData' in normalizedTensor && typeof normalizedTensor.toImageData === 'function') {
        return normalizedTensor.toImageData({ tensorLayout: 'NCHW', format: 'RGB' });
      }
    } catch (error) {
      console.warn('toImageData not available, using manual conversion');
    }

    // Manual conversion as fallback
    const imageData = new ImageData(width, height);
    const pixels = imageData.data;

    // Convert from NCHW to RGBA
    for (let h = 0; h < height; h++) {
      for (let w = 0; w < width; w++) {
        const pixelIndex = (h * width + w) * 4;
        const tensorIndex = h * width + w;

        // RGB channels (assuming NCHW format: [N, C, H, W])
        const r = Math.round(normalizedData[tensorIndex] * 255);
        const g = Math.round(normalizedData[width * height + tensorIndex] * 255);
        const b = Math.round(normalizedData[2 * width * height + tensorIndex] * 255);

        pixels[pixelIndex] = Math.max(0, Math.min(255, r));     // R
        pixels[pixelIndex + 1] = Math.max(0, Math.min(255, g)); // G
        pixels[pixelIndex + 2] = Math.max(0, Math.min(255, b)); // B
        pixels[pixelIndex + 3] = 255;                           // A
      }
    }

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
  }
}
