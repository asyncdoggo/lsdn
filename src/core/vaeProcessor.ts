import * as ort from 'onnxruntime-web/webgpu';
import { PerformanceMonitor } from '../utils/performanceMonitor';

export class VAEProcessor {
  private performanceMonitor = PerformanceMonitor.getInstance();
  private readonly vaeScalingFactor = 0.18215;

  /**
   * Convert tensor to ImageData using built-in ONNX method
   */
  tensorToImageData(tensor: ort.Tensor, width: number, height: number): ImageData {
    // Check if the built-in method is available
    if ('toImageData' in tensor && typeof tensor.toImageData === 'function') {
      try {
        // Use the built-in toImageData method - much more efficient!
        const result = (tensor as any).toImageData({ 
          tensorLayout: 'NCHW', 
          format: 'RGB'
        });
        this.performanceMonitor.recordTensorOp('reuse');
        console.log('🎨 Used built-in tensor.toImageData() method');
        return result;
      } catch (error) {
        console.warn('Built-in toImageData failed:', error);
      }
    }
    
    console.log('📝 Using fallback tensor conversion');
    
    // Simple fallback without complex optimizations
    const imageData = new ImageData(width, height);
    const pixels = imageData.data;
    const tensorData = tensor.data as Float32Array;
    
    for (let i = 0; i < width * height; i++) {
      // NCHW format: [N, C, H, W]
      const r = Math.round((tensorData[i] + 1) * 127.5); // Denormalize from [-1,1] to [0,255]
      const g = Math.round((tensorData[width * height + i] + 1) * 127.5);
      const b = Math.round((tensorData[2 * width * height + i] + 1) * 127.5);
      
      const pixelIdx = i * 4;
      pixels[pixelIdx] = Math.max(0, Math.min(255, r));     // R
      pixels[pixelIdx + 1] = Math.max(0, Math.min(255, g)); // G
      pixels[pixelIdx + 2] = Math.max(0, Math.min(255, b)); // B
      pixels[pixelIdx + 3] = 255;                           // A
    }
    
    this.performanceMonitor.recordTensorOp('create');
    return imageData;
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
