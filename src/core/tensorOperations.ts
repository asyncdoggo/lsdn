import * as ort from 'onnxruntime-web/webgpu';
import { TensorPool } from '../utils/tensorPool';
import { PerformanceMonitor } from '../utils/performanceMonitor';

export class TensorOperations {
  private tensorPool = TensorPool.getInstance();
  private performanceMonitor = PerformanceMonitor.getInstance();

  /**
   * Create output tensor for final image (optimized with tensor pool)
   */
  createOutputTensor(channels: number, height: number, width: number): ort.Tensor {
    const tensor = this.tensorPool.getTensor('float32', [1, channels, height, width]);
    this.performanceMonitor.recordTensorOp('create', tensor.size * 4); // 4 bytes per float32
    return tensor;
  }

  /**
   * Create weight tensor for blending (optimized with tensor pool)
   */
  createWeightTensor(channels: number, height: number, width: number): ort.Tensor {
    const tensor = this.tensorPool.getTensor('float32', [1, channels, height, width]);
    this.performanceMonitor.recordTensorOp('create', tensor.size * 4); // 4 bytes per float32
    return tensor;
  }

  /**
   * Optimized tensor disposal with proper pool tracking
   */
  disposeTensor(tensor: ort.Tensor): void {
    // Return to pool for reuse
    this.tensorPool.returnTensor(tensor);
    this.performanceMonitor.recordTensorOp('dispose');
  }

  /**
   * Create batched tensor for CFG inference (with performance tracking and pool usage)
   */
  createBatchedTensor(tensor1: ort.Tensor, tensor2: ort.Tensor): ort.Tensor {
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
  splitBatchedTensor(batchedTensor: ort.Tensor): [ort.Tensor, ort.Tensor] {
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
   * Extract a tile from the latent tensor
   */
  extractTile(
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
   * Pad a tile tensor to match the expected VAE session dimensions
   */
  padTileIfNeeded(
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
}
