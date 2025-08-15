import * as ort from 'onnxruntime-web/webgpu';
import { PerformanceMonitor } from '../utils/performanceMonitor';

export class VAEProcessor {
  private performanceMonitor = PerformanceMonitor.getInstance();
  private readonly vaeScalingFactor = 0.18215;

  /**
   * Convert tensor to ImageData using built-in ONNX method with normalization
   */
  tensorToImageData(tensor: ort.Tensor): ImageData {
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

    // Use ONNX tensor's built-in toImageData method with normalized data
    const normalizedTensor = new ort.Tensor('float16', normalizedData, tensor.dims);
    this.performanceMonitor.recordTensorOp('reuse');
    console.log('🎨 Used built-in tensor.toImageData() method with normalized data');
    return (normalizedTensor as any).toImageData({ tensorLayout: 'NCHW', format: 'RGB' });
  }

  /**
   * Apply VAE scaling factor to latent
   */
  applyVAEScaling(latent: ort.Tensor): ort.Tensor {
    const vaeScaledData = new Float16Array(latent.data.length);
    for (let i = 0; i < latent.data.length; i++) {
      vaeScaledData[i] = (latent.data as Float16Array)[i] / this.vaeScalingFactor;
    }
    return new ort.Tensor('float16', vaeScaledData, latent.dims);
  }
}
