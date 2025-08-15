// Performance optimization utilities
export { TensorPool } from './tensorPool';
export { AsyncPipeline, OptimizedTensorOps } from './asyncPipeline';
export { 
  PerformanceMonitor, 
  MemoryTracker, 
  timed,
  type PerformanceMetrics,
  type StageMetrics,
  type MemoryMetrics,
  type TensorStats,
  type GPUMetrics
} from './performanceMonitor';

// Latent preview utilities
export { LatentPreview } from './latentPreview';

// Import for internal use
import { TensorPool } from './tensorPool';
import { OptimizedTensorOps } from './asyncPipeline';
import { PerformanceMonitor } from './performanceMonitor';

/**
 * Initialize all optimization systems
 */
export async function initializeOptimizations(): Promise<void> {
  // Initialize optimized tensor operations
  await OptimizedTensorOps.initialize();
  
  // Set up performance monitoring
  const monitor = PerformanceMonitor.getInstance();
  monitor.setEnabled(true);
  
  // Configure tensor pool
  const pool = TensorPool.getInstance();
  pool.setMaxPoolSize(20);
  
  console.log('🚀 Performance optimizations initialized');
}

/**
 * Get optimization statistics
 */
export function getOptimizationStats() {
  const pool = TensorPool.getInstance();
  const monitor = PerformanceMonitor.getInstance();
  
  return {
    tensorPool: pool.getStats(),
    monitoring: monitor
  };
}
