/**
 * WebWorker for background tensor operations to prevent UI blocking
 */

// Worker message types
export interface WorkerMessage {
  id: string;
  type: 'tensor_operation' | 'image_processing' | 'noise_generation';
  data: any;
}

export interface WorkerResponse {
  id: string;
  success: boolean;
  result?: any;
  error?: string;
}

// Tensor operation types
export interface TensorOperation {
  operation: 'add' | 'multiply' | 'normalize' | 'blend' | 'resize';
  tensors: ArrayBuffer[];
  params: any;
}

self.onmessage = async (event: MessageEvent<WorkerMessage>) => {
  const { id, type, data } = event.data;
  
  try {
    let result: any;
    
    switch (type) {
      case 'tensor_operation':
        result = await processTensorOperation(data as TensorOperation);
        break;
        
      case 'image_processing':
        result = await processImageData(data);
        break;
        
      case 'noise_generation':
        result = await generateNoise(data);
        break;
        
      default:
        throw new Error(`Unknown operation type: ${type}`);
    }
    
    self.postMessage({
      id,
      success: true,
      result
    } as WorkerResponse);
    
  } catch (error) {
    self.postMessage({
      id,
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    } as WorkerResponse);
  }
};

/**
 * Process tensor operations in background
 */
async function processTensorOperation(operation: TensorOperation): Promise<ArrayBuffer> {
  const { operation: op, tensors, params } = operation;
  
  switch (op) {
    case 'normalize':
      return normalizeData(tensors[0], params.min, params.max);
      
    case 'blend':
      return blendTensors(tensors, params.weights);
      
    case 'add':
      return addTensors(tensors[0], tensors[1]);
      
    case 'multiply':
      return multiplyTensors(tensors[0], tensors[1], params.scalar);
      
    default:
      throw new Error(`Unknown tensor operation: ${op}`);
  }
}

/**
 * Normalize tensor data from [-1, 1] to [0, 1]
 */
function normalizeData(buffer: ArrayBuffer, min: number = -1, max: number = 1): ArrayBuffer {
  const input = new Float32Array(buffer);
  const output = new Float32Array(input.length);
  
  for (let i = 0; i < input.length; i++) {
    let x = input[i];
    x = (x - min) / (max - min);
    output[i] = Math.max(0, Math.min(1, x));
  }
  
  return output.buffer;
}

/**
 * Blend multiple tensors with weights
 */
function blendTensors(buffers: ArrayBuffer[], weights: number[]): ArrayBuffer {
  if (buffers.length !== weights.length) {
    throw new Error('Number of tensors must match number of weights');
  }
  
  const arrays = buffers.map(buffer => new Float32Array(buffer));
  const output = new Float32Array(arrays[0].length);
  
  // Normalize weights
  const weightSum = weights.reduce((sum, w) => sum + w, 0);
  const normalizedWeights = weights.map(w => w / weightSum);
  
  for (let i = 0; i < output.length; i++) {
    let value = 0;
    for (let j = 0; j < arrays.length; j++) {
      value += arrays[j][i] * normalizedWeights[j];
    }
    output[i] = value;
  }
  
  return output.buffer;
}

/**
 * Add two tensors element-wise
 */
function addTensors(buffer1: ArrayBuffer, buffer2: ArrayBuffer): ArrayBuffer {
  const array1 = new Float32Array(buffer1);
  const array2 = new Float32Array(buffer2);
  const output = new Float32Array(array1.length);
  
  for (let i = 0; i < array1.length; i++) {
    output[i] = array1[i] + array2[i];
  }
  
  return output.buffer;
}

/**
 * Multiply tensor by scalar or element-wise with another tensor
 */
function multiplyTensors(buffer1: ArrayBuffer, buffer2: ArrayBuffer | null, scalar?: number): ArrayBuffer {
  const array1 = new Float32Array(buffer1);
  const output = new Float32Array(array1.length);
  
  if (scalar !== undefined) {
    // Scalar multiplication
    for (let i = 0; i < array1.length; i++) {
      output[i] = array1[i] * scalar;
    }
  } else if (buffer2) {
    // Element-wise multiplication
    const array2 = new Float32Array(buffer2);
    for (let i = 0; i < array1.length; i++) {
      output[i] = array1[i] * array2[i];
    }
  }
  
  return output.buffer;
}

/**
 * Process image data operations
 */
async function processImageData(data: any): Promise<ArrayBuffer> {
  const { operation, imageData, params } = data;
  
  switch (operation) {
    case 'resize':
      return resizeImageData(imageData, params.width, params.height);
      
    case 'convert_colorspace':
      return convertColorSpace(imageData, params.from, params.to);
      
    default:
      throw new Error(`Unknown image operation: ${operation}`);
  }
}

/**
 * Resize image data using bilinear interpolation
 */
function resizeImageData(imageData: ImageData, newWidth: number, newHeight: number): ArrayBuffer {
  const { data, width, height } = imageData;
  const output = new Uint8ClampedArray(newWidth * newHeight * 4);
  
  const xRatio = width / newWidth;
  const yRatio = height / newHeight;
  
  for (let y = 0; y < newHeight; y++) {
    for (let x = 0; x < newWidth; x++) {
      const srcX = x * xRatio;
      const srcY = y * yRatio;
      
      const x1 = Math.floor(srcX);
      const y1 = Math.floor(srcY);
      const x2 = Math.min(x1 + 1, width - 1);
      const y2 = Math.min(y1 + 1, height - 1);
      
      const fx = srcX - x1;
      const fy = srcY - y1;
      
      for (let c = 0; c < 4; c++) {
        const p1 = data[(y1 * width + x1) * 4 + c];
        const p2 = data[(y1 * width + x2) * 4 + c];
        const p3 = data[(y2 * width + x1) * 4 + c];
        const p4 = data[(y2 * width + x2) * 4 + c];
        
        const interpolated = 
          p1 * (1 - fx) * (1 - fy) +
          p2 * fx * (1 - fy) +
          p3 * (1 - fx) * fy +
          p4 * fx * fy;
        
        output[(y * newWidth + x) * 4 + c] = Math.round(interpolated);
      }
    }
  }
  
  return output.buffer;
}

/**
 * Convert between color spaces
 */
function convertColorSpace(imageData: ImageData, from: string, to: string): ArrayBuffer {
  // Placeholder for color space conversion
  // For now, just return the original data
  return imageData.data.buffer.slice(0);
}

/**
 * Generate noise patterns
 */
async function generateNoise(data: any): Promise<ArrayBuffer> {
  const { type, width, height, params } = data;
  const output = new Float32Array(width * height * 3); // RGB
  
  switch (type) {
    case 'gaussian':
      generateGaussianNoise(output, params.mean || 0, params.std || 1);
      break;
      
    case 'perlin':
      generatePerlinNoise(output, width, height, params);
      break;
      
    case 'uniform':
      generateUniformNoise(output, params.min || 0, params.max || 1);
      break;
      
    default:
      throw new Error(`Unknown noise type: ${type}`);
  }
  
  return output.buffer;
}

/**
 * Generate Gaussian noise
 */
function generateGaussianNoise(output: Float32Array, mean: number, std: number): void {
  for (let i = 0; i < output.length; i += 2) {
    // Box-Muller transform for Gaussian distribution
    const u1 = Math.random();
    const u2 = Math.random();
    
    const z0 = Math.sqrt(-2 * Math.log(u1)) * Math.cos(2 * Math.PI * u2);
    const z1 = Math.sqrt(-2 * Math.log(u1)) * Math.sin(2 * Math.PI * u2);
    
    output[i] = z0 * std + mean;
    if (i + 1 < output.length) {
      output[i + 1] = z1 * std + mean;
    }
  }
}

/**
 * Generate uniform noise
 */
function generateUniformNoise(output: Float32Array, min: number, max: number): void {
  for (let i = 0; i < output.length; i++) {
    output[i] = Math.random() * (max - min) + min;
  }
}

/**
 * Generate Perlin noise (simplified implementation)
 */
function generatePerlinNoise(output: Float32Array, width: number, height: number, params: any): void {
  const scale = params.scale || 0.1;
  const octaves = params.octaves || 4;
  const persistence = params.persistence || 0.5;
  
  for (let y = 0; y < height; y++) {
    for (let x = 0; x < width; x++) {
      let value = 0;
      let amplitude = 1;
      let frequency = scale;
      
      for (let i = 0; i < octaves; i++) {
        value += noise(x * frequency, y * frequency) * amplitude;
        amplitude *= persistence;
        frequency *= 2;
      }
      
      const idx = (y * width + x) * 3;
      output[idx] = value;     // R
      output[idx + 1] = value; // G
      output[idx + 2] = value; // B
    }
  }
}

/**
 * Simple noise function for Perlin noise
 */
function noise(x: number, y: number): number {
  const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
  return (n - Math.floor(n)) * 2 - 1;
}
