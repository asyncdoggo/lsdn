import * as ort from 'onnxruntime-web/webgpu';
import { TensorOperations } from './tensorOperations';
import { ModelManager } from './modelManager';

export class TiledVAEProcessor {
  private tensorOps = new TensorOperations();
  private modelManager: ModelManager;

  constructor(modelManager: ModelManager) {
    this.modelManager = modelManager;
  }

  /**
   * Decode VAE using tiled processing to reduce memory usage
   */
  async decodeTiledVAE(
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
    const outputTensor = this.tensorOps.createOutputTensor(outputChannels, height, width);
    
    // Create weight tensor for blending overlapping regions (using optimized tensor pool)
    const weightTensor = this.tensorOps.createWeightTensor(outputChannels, height, width);
    
    // Create a single VAE session that can handle the maximum tile size (with overlap)
    const maxTileSizeLatent = tileSizeLatent + overlapLatent;
    const vaeSession = await this.modelManager.createVAESession(maxTileSizeLatent, maxTileSizeLatent, onProgress);
    
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
          const tileLatent = this.tensorOps.extractTile(latent, startX, startY, tileLatentWidth, tileLatentHeight);
          
          // If tile is smaller than max tile size, pad it to match VAE session dimensions
          const paddedTileLatent = this.tensorOps.padTileIfNeeded(tileLatent, maxTileSizeLatent, maxTileSizeLatent);
          
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
          this.tensorOps.disposeTensor(tileLatent);
          this.tensorOps.disposeTensor(paddedTileLatent);
          this.tensorOps.disposeTensor(tileSample);
          
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
      this.tensorOps.disposeTensor(weightTensor);
      
    } finally {
      // Clean up the single VAE session after processing all tiles
      await vaeSession.release();
    }
    
    return outputTensor;
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
}
