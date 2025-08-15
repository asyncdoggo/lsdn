import * as ort from 'onnxruntime-web/webgpu';

/**
 * Tensor pool for efficient memory reuse and reduced garbage collection
 */
export class TensorPool {
  private static instance: TensorPool;
  private pools: Map<string, ort.Tensor[]> = new Map();
  private maxPoolSize = 10;
  private totalAllocated = 0;
  private totalReused = 0;
  private totalHits = 0;
  private totalMisses = 0;

  static getInstance(): TensorPool {
    if (!TensorPool.instance) {
      TensorPool.instance = new TensorPool();
    }
    return TensorPool.instance;
  }

  private getPoolKey(type: string, dims: readonly number[]): string {
    return `${type}_${dims.join('x')}`;
  }

  /**
   * Get a tensor from the pool or create a new one
   */
  getTensor(type: 'float16' | 'float32', dims: readonly number[]): ort.Tensor {
    const key = this.getPoolKey(type, dims);
    const pool = this.pools.get(key);
    
    if (pool && pool.length > 0) {
      const tensor = pool.pop()!;
      this.totalReused++;
      this.totalHits++;
      
      // Clear the tensor data
      if (type === 'float16') {
        (tensor.data as Float16Array).fill(0);
      } else {
        (tensor.data as Float32Array).fill(0);
      }
      
      return tensor;
    }
    
    // Create new tensor - this counts as a miss if we were expecting a hit
    this.totalAllocated++;
    this.totalMisses++;
    const size = dims.reduce((a, b) => a * b, 1);
    
    if (type === 'float16') {
      return new ort.Tensor('float16', new Float16Array(size), dims);
    } else {
      return new ort.Tensor('float32', new Float32Array(size), dims);
    }
  }

  /**
   * Return a tensor to the pool for reuse
   */
  returnTensor(tensor: ort.Tensor): void {
    const key = this.getPoolKey(tensor.type, tensor.dims);
    
    if (!this.pools.has(key)) {
      this.pools.set(key, []);
    }
    
    const pool = this.pools.get(key)!;
    if (pool.length < this.maxPoolSize) {
      pool.push(tensor);
    } else {
      // Pool is full, dispose the tensor
      tensor.dispose?.();
    }
  }

  /**
   * Get pool statistics
   */
  getStats(): { allocated: number; reused: number; pools: number; totalTensorsInPool: number; hitRate: number } {
    const totalTensorsInPool = Array.from(this.pools.values())
      .reduce((sum, pool) => sum + pool.length, 0);
    
    const hitRate = this.totalHits + this.totalMisses > 0 ? 
      (this.totalHits / (this.totalHits + this.totalMisses)) * 100 : 0;
    
    return {
      allocated: this.totalAllocated,
      reused: this.totalReused,
      pools: this.pools.size,
      totalTensorsInPool,
      hitRate
    };
  }

  /**
   * Clear all pools and dispose tensors
   */
  clear(): void {
    for (const pool of this.pools.values()) {
      for (const tensor of pool) {
        tensor.dispose?.();
      }
    }
    this.pools.clear();
    this.totalAllocated = 0;
    this.totalReused = 0;
    this.totalHits = 0;
    this.totalMisses = 0;
  }

  /**
   * Set maximum pool size per tensor type
   */
  setMaxPoolSize(size: number): void {
    this.maxPoolSize = size;
  }
}
