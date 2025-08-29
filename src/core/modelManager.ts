import * as ort from 'onnxruntime-web/webgpu';
import { AutoTokenizer, env, PreTrainedTokenizer } from '@xenova/transformers';

// Do not change the below or PretrainedTokenizer will not work
env.allowLocalModels = false;
env.useBrowserCache = false;

let BASE_URL = "https://huggingface.co/subpixel/small-stable-diffusion-v0-onnx-ort-web/resolve/main";
// let BASE_URL="/models/trinart_stable_diffusion_v2"

export const MODEL_URLS = {
  "unet": `${BASE_URL}/unet/model.onnx`,
  "textEncoder": `${BASE_URL}/text_encoder/model.onnx`,
  "vaeDecoder": `${BASE_URL}/vae_decoder/model.onnx`,
  "vaeEncoder": `${BASE_URL}/vae_encoder/model.onnx`,
  "weights_url": `${BASE_URL}/unet/weights.pb`
};

export interface ModelSessions {
  textEncoder?: { sess: ort.InferenceSession };
  unet?: { sess: ort.InferenceSession };
  vaeDecoder?: { sess: ort.InferenceSession };
}

export function setBaseUrl(model_id: string): void {
  const hfUrl = "https://huggingface.co/{model_id}/resolve/main";
  BASE_URL = hfUrl.replace('{model_id}', model_id);
}

export class ModelManager {
  async clearCache() {
    // Clear the cache
    caches.delete("onnx")
  }
  private models: ModelSessions = {};
  private isLoaded = false;
  private tokenizer: PreTrainedTokenizer | null = null;
  private currentLatentDimensions: [number, number] | null = null;

  // Model configuration templates
  private readonly modelConfig = {
    textEncoder: {
      url: MODEL_URLS.textEncoder,
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
      url: MODEL_URLS.unet,
      weightsUrl: MODEL_URLS.weights_url,
      baseOpt: {
        externalData: [{
          path: './weights.pb',
          data: MODEL_URLS.weights_url
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
      url: MODEL_URLS.vaeDecoder,
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
    },
    vaeEncoder: {
      url: MODEL_URLS.vaeEncoder,
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

  constructor() {
    // Configure ONNX Runtime to find WASM files
    ort.env.wasm.wasmPaths = import.meta.env.DEV 
      ? '/node_modules/onnxruntime-web/dist/' // Development path
      : '/onnx/'; // Production path - copied files from node_modules
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
  getLatentDimensions(height: number, width: number): [number, number] {
    // VAE encoder downsamples by factor of 8
    return [height / 8, width / 8];
  }

  /**
   * Create UNet session with specific dimensions
   */
  async createUNetSession(latentHeight: number, latentWidth: number, onProgress?: (stage: string, progress: number) => void): Promise<ort.InferenceSession> {
    const unetBytes = await this.fetchAndCache(this.modelConfig.unet.url, onProgress, 'UNet Model');
    let weightsBytes = new ArrayBuffer(0);

    if (this.modelConfig.unet.weightsUrl) {
      weightsBytes = await this.fetchAndCache(this.modelConfig.unet.weightsUrl, onProgress, 'UNet Weights');
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

  async createTextEncoderSession(onProgress?: (stage: string, progress: number) => void): Promise<ort.InferenceSession> {
    const textEncoderBytes = await this.fetchAndCache(this.modelConfig.textEncoder.url, onProgress, 'Text Encoder');

    const textEncoderOptions = {
      ...this.modelConfig.textEncoder.opt,
      freeDimensionOverrides: {
        batch_size: 1,
        sequence_length: 77
      }
    };

    return await ort.InferenceSession.create(textEncoderBytes, textEncoderOptions);
  }

  /**
   * Create VAE decoder session with specific dimensions
   */
  async createVAEDecoderSession(latentHeight: number, latentWidth: number, onProgress?: (stage: string, progress: number) => void): Promise<ort.InferenceSession> {
    this.modelConfig.vaeDecoder.url = BASE_URL + '/vae_decoder/model.onnx';

    const vaeBytes = await this.fetchAndCache(this.modelConfig.vaeDecoder.url, onProgress, 'VAE Decoder');

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

  async createVAEEncoderSession(latentHeight: number, latentWidth: number, onProgress?: (stage: string, progress: number) => void): Promise<ort.InferenceSession> {
    const vaeBytes = await this.fetchAndCache(this.modelConfig.vaeEncoder.url, onProgress, 'VAE Encoder');

    const vaeOptions = {
      ...this.modelConfig.vaeEncoder.baseOpt,
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
   * Fetch and cache model files
   */
  private async fetchAndCache(url: string, onProgress?: (stage: string, progress: number) => void, modelName?: string): Promise<ArrayBuffer> {
    try {
      const cache = await caches.open("onnx");
      let cachedResponse = await cache.match(url);
      if (cachedResponse === undefined) {
        // Model needs to be downloaded from network
        if (onProgress && modelName) {
          onProgress(`Downloading ${modelName} from network...`, 0.1);
        }
        console.log(`${url} (downloading from network)`);

        // start fetch
        const response = await fetch(url);
        if (!response.ok) {
          throw new Error(`Failed to fetch model from ${url}: ${response.statusText}`);
        }

        // Get reader
        const reader = response.body?.getReader();
        if (!reader) {
          throw new Error(`Failed to get reader for ${url}`);
        }
        const contentLength = +response.headers.get("Content-Length")!;
        let receivedLength = 0;
        let chunks = [];
        while (true) {
          const { done, value } = await reader.read();
          if (done) break;
          chunks.push(value);
          receivedLength += value.length;
          if (onProgress) {
            onProgress(`Downloading ${modelName} from network... (This is a one-time operation)`, 0.1 + (receivedLength / contentLength) * 0.8);
          }
        }
        // Reconstruct body
        const blob = new Blob(chunks);
        const fullResponse = new Response(blob, {
          headers: response.headers
        });

        // Put into cache
        await cache.put(url, fullResponse);
        cachedResponse = await cache.match(url);

        if(!cachedResponse) {
          throw new Error(`Failed to cache response for ${url}`);
        }
      } else {
        console.log(`${url} (cached)`);
      }
      if (cachedResponse) {
        return await cachedResponse.arrayBuffer();
      }
      throw new Error('Failed to cache response');
    } catch (error) {
      alert(`Failed to fetch model from ${url}: ${error}`);
      throw error;
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
   * Load models, VAE is loaded on demand
   */
  async loadModels(onProgress: (stage: string, progress: number) => void, resolution: { height: number; width: number }): Promise<void> {

    const baseUrlChanged = this.modelConfig.unet.url !== BASE_URL + '/unet/model.onnx';
  
    this.modelConfig.unet.url = BASE_URL + '/unet/model.onnx';
    this.modelConfig.unet.weightsUrl = BASE_URL + '/unet/weights.pb';
    this.modelConfig.vaeDecoder.url = BASE_URL + '/vae_decoder/model.onnx';
    this.modelConfig.textEncoder.url = BASE_URL + '/text_encoder/model.onnx';

    try {
    
      if (!this.models.textEncoder?.sess || baseUrlChanged) {
        // Load text encoder
        if (onProgress) onProgress('Loading Text Encoder', 0.2);
        this.models.textEncoder = {
          sess: await this.createTextEncoderSession(onProgress)
        };
      }

      if (onProgress) onProgress('Loading Tokenizer', 0.4);

      // Load tokenizer
      await this.initializeTokenizer();

      if (onProgress) onProgress('Loading UNet', 0.6);

      // Load UNet for default 512px resolution
      const [latentHeight, latentWidth] = this.getLatentDimensions(resolution.height, resolution.width);

      const dimensionsChanged = this.currentLatentDimensions?.[0] !== latentHeight ||
      this.currentLatentDimensions?.[1] !== latentWidth;


      if (!this.models.unet?.sess || dimensionsChanged || baseUrlChanged) {
        this.models.unet = {
          sess: await this.createUNetSession(latentHeight, latentWidth, onProgress)
        };
      }

      this.currentLatentDimensions = [latentHeight, latentWidth];

      if (onProgress) onProgress('Models Loaded', 1.0);

    } catch (error) {
      console.error('Failed to load models:', error);
      throw new Error(`Model loading failed: ${error}`);
    }
  }


  /**
   * Get models (for external access)
   */
  getModels(): ModelSessions {
    return this.models;
  }

  /**
   * Get tokenizer (for external access)
   */
  getTokenizer(): PreTrainedTokenizer | null {
    return this.tokenizer;
  }

  /**
   * Check if models are loaded
   */
  get modelsLoaded(): boolean {
    return this.isLoaded;
  }

  /**
   * Get current latent dimensions
   */
  getCurrentLatentDimensions(): [number, number] | null {
    return this.currentLatentDimensions;
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
