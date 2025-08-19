import * as ort from 'onnxruntime-web/webgpu';

/**
 * Fast latent to RGB conversion utility for real-time preview during generation.
 * Uses a simplified approach to convert latents to viewable RGB without full VAE decoding.
 */
export class LatentPreview {
  /**
   * Convert latent tensor to RGB ImageData for quick preview.
   * This is a fast approximation, not the full VAE decode.
   * 
   * @param latent The latent tensor from the diffusion process
   * @param width Output width (should be 64 for fast preview)
   * @param height Output height (should be 64 for fast preview)
   * @returns ImageData that can be drawn to canvas
   */
  static latentToRGB(latent: ort.Tensor, width: number = 64, height: number = 64): ImageData {
    const latentData = latent.data as Float16Array;
    const [, , latentHeight, latentWidth] = latent.dims as [number, number, number, number];
    
    // Ensure we're working with 64x64 latent (8x8 latent space for 64x64 image)
    const targetWidth = Math.min(width, 64);
    const targetHeight = Math.min(height, 64);
    
    // Create ImageData for the output
    const imageData = new ImageData(targetWidth, targetHeight);
    const pixels = imageData.data;
    
    // Fast latent-to-RGB approximation
    // This is based on the fact that latents roughly correspond to image features
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        // Map pixel coordinates to latent coordinates
        const latentX = Math.floor((x / targetWidth) * latentWidth);
        const latentY = Math.floor((y / targetHeight) * latentHeight);
        
        // Get latent values for all 4 channels
        const baseIdx = latentY * latentWidth + latentX;
        const ch0 = latentData[baseIdx] || 0; // Channel 0
        const ch1 = latentData[latentHeight * latentWidth + baseIdx] || 0; // Channel 1
        const ch2 = latentData[2 * latentHeight * latentWidth + baseIdx] || 0; // Channel 2
        const ch3 = latentData[3 * latentHeight * latentWidth + baseIdx] || 0; // Channel 3
        
        // Simple mapping from latent channels to RGB
        // This is a rough approximation - each channel contributes to RGB differently
        let r = this.normalizeLatentValue(ch0 * 0.5 + ch2 * 0.3);
        let g = this.normalizeLatentValue(ch1 * 0.6 + ch0 * 0.2);
        let b = this.normalizeLatentValue(ch2 * 0.4 + ch3 * 0.4);
        
        // Apply some contrast and brightness adjustments for better visibility
        r = this.enhanceContrast(r);
        g = this.enhanceContrast(g);
        b = this.enhanceContrast(b);
        
        // Convert to 0-255 range
        const pixelIdx = (y * targetWidth + x) * 4;
        pixels[pixelIdx] = Math.max(0, Math.min(255, Math.round(r * 255)));     // R
        pixels[pixelIdx + 1] = Math.max(0, Math.min(255, Math.round(g * 255))); // G
        pixels[pixelIdx + 2] = Math.max(0, Math.min(255, Math.round(b * 255))); // B
        pixels[pixelIdx + 3] = 255; // A (fully opaque)
      }
    }
    
    return imageData;
  }
  
  /**
   * Normalize latent values to 0-1 range with some heuristics
   */
  private static normalizeLatentValue(value: number): number {
    // Latent values are typically in a range around -4 to +4
    // Apply tanh-like scaling to map to 0-1
    const scaled = value / 4.0; // Scale down
    const normalized = (Math.tanh(scaled) + 1) / 2; // Map -1,1 to 0,1
    return Math.max(0, Math.min(1, normalized));
  }
  
  /**
   * Enhance contrast for better preview visibility
   */
  private static enhanceContrast(value: number): number {
    // Apply S-curve for better contrast
    const enhanced = value * value * (3.0 - 2.0 * value);
    return Math.max(0, Math.min(1, enhanced));
  }
  
  /**
   * Alternative conversion method using weighted channel mixing
   * This version tries to approximate actual RGB mapping better
   */
  static latentToRGBAdvanced(latent: ort.Tensor, width: number = 64, height: number = 64): ImageData {
    const latentData = latent.data as Float16Array;
    const [, , latentHeight, latentWidth] = latent.dims as [number, number, number, number];
    
    // const targetWidth = Math.min(width, 64);
    // const targetHeight = Math.min(height, 64);
    const targetWidth = Math.round(width / 3);
    const targetHeight = Math.round(height / 3);

    const imageData = new ImageData(targetWidth, targetHeight);
    const pixels = imageData.data;
    
    // More sophisticated channel mixing based on typical VAE behavior
    const rgbWeights = [
      [0.298, 0.207, 0.208, 0.287], // R weights for channels 0,1,2,3
      [0.187, 0.448, 0.173, 0.192], // G weights
      [0.214, 0.178, 0.402, 0.206]  // B weights
    ];
    
    for (let y = 0; y < targetHeight; y++) {
      for (let x = 0; x < targetWidth; x++) {
        const latentX = Math.floor((x / targetWidth) * latentWidth);
        const latentY = Math.floor((y / targetHeight) * latentHeight);
        
        const baseIdx = latentY * latentWidth + latentX;
        const latentValues = [
          latentData[baseIdx] || 0,
          latentData[latentHeight * latentWidth + baseIdx] || 0,
          latentData[2 * latentHeight * latentWidth + baseIdx] || 0,
          latentData[3 * latentHeight * latentWidth + baseIdx] || 0
        ];
        
        // Apply weighted mixing
        let r = 0, g = 0, b = 0;
        for (let ch = 0; ch < 4; ch++) {
          const normalizedVal = this.normalizeLatentValue(latentValues[ch]);
          r += normalizedVal * rgbWeights[0][ch];
          g += normalizedVal * rgbWeights[1][ch];
          b += normalizedVal * rgbWeights[2][ch];
        }
        
        // Apply gamma correction for better visibility
        r = Math.pow(Math.max(0, Math.min(1, r)), 0.8);
        g = Math.pow(Math.max(0, Math.min(1, g)), 0.8);
        b = Math.pow(Math.max(0, Math.min(1, b)), 0.8);
        
        const pixelIdx = (y * targetWidth + x) * 4;
        pixels[pixelIdx] = Math.round(r * 255);
        pixels[pixelIdx + 1] = Math.round(g * 255);
        pixels[pixelIdx + 2] = Math.round(b * 255);
        pixels[pixelIdx + 3] = 255;
      }
    }
    
    return imageData;
  }
}
