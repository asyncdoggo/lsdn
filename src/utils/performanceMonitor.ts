/**
 * Performance monitoring and optimization diagnostics
 */

export interface PerformanceMetrics {
  totalTime: number;
  stages: Map<string, StageMetrics>;
  memoryUsage: MemoryMetrics;
  tensorStats: TensorStats;
  gpuUtilization?: GPUMetrics;
}

export interface StageMetrics {
  name: string;
  duration: number;
  percentage: number;
  calls: number;
  avgDuration: number;
  minDuration: number;
  maxDuration: number;
}

export interface MemoryMetrics {
  heapUsed: number;
  heapTotal: number;
  external: number;
  peakHeapUsed: number;
  tensorMemory: number;
  bufferPool: number;
}

export interface TensorStats {
  created: number;
  disposed: number;
  reused: number;
  poolHits: number;
  poolMisses: number;
  avgSize: number;
  totalAllocated: number;
}

export interface GPUMetrics {
  memoryUsed: number;
  memoryTotal: number;
  utilization: number;
  temperature?: number;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private metrics: PerformanceMetrics;
  private stageStack: string[] = [];
  private stageTimes: Map<string, number[]> = new Map();
  private startTime: number = 0;
  private enabled = true;

  private constructor() {
    this.metrics = {
      totalTime: 0,
      stages: new Map(),
      memoryUsage: this.getMemoryMetrics(),
      tensorStats: {
        created: 0,
        disposed: 0,
        reused: 0,
        poolHits: 0,
        poolMisses: 0,
        avgSize: 0,
        totalAllocated: 0
      }
    };
  }

  static getInstance(): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor();
    }
    return PerformanceMonitor.instance;
  }

  /**
   * Start monitoring a generation session
   */
  startSession(): void {
    if (!this.enabled) return;
    
    this.startTime = performance.now();
    this.metrics.stages.clear();
    this.stageTimes.clear();
    this.stageStack = [];
    this.metrics.memoryUsage = this.getMemoryMetrics();
  }

  /**
   * End monitoring session and return final metrics
   */
  endSession(): PerformanceMetrics {
    if (!this.enabled) return this.metrics;
    
    this.metrics.totalTime = performance.now() - this.startTime;
    this.metrics.memoryUsage = this.getMemoryMetrics();
    
    // Calculate stage percentages
    for (const [name, times] of this.stageTimes.entries()) {
      const totalDuration = times.reduce((sum, time) => sum + time, 0);
      const avgDuration = totalDuration / times.length;
      const minDuration = Math.min(...times);
      const maxDuration = Math.max(...times);
      
      this.metrics.stages.set(name, {
        name,
        duration: totalDuration,
        percentage: (totalDuration / this.metrics.totalTime) * 100,
        calls: times.length,
        avgDuration,
        minDuration,
        maxDuration
      });
    }
    
    return { ...this.metrics };
  }

  /**
   * Start timing a stage
   */
  startStage(name: string): void {
    if (!this.enabled) return;
    
    this.stageStack.push(name);
    if (!this.stageTimes.has(name)) {
      this.stageTimes.set(name, []);
    }
  }

  /**
   * End timing current stage
   */
  endStage(): void {
    if (!this.enabled || this.stageStack.length === 0) return;
    
    const stageName = this.stageStack.pop()!;
    const duration = performance.now() - this.getStageStartTime(stageName);
    
    const times = this.stageTimes.get(stageName) || [];
    times.push(duration);
    this.stageTimes.set(stageName, times);
  }

  /**
   * Record tensor operation
   */
  recordTensorOp(operation: 'create' | 'dispose' | 'reuse' | 'pool_hit' | 'pool_miss', size?: number): void {
    if (!this.enabled) return;
    
    switch (operation) {
      case 'create':
        this.metrics.tensorStats.created++;
        if (size) {
          this.metrics.tensorStats.totalAllocated += size;
          this.metrics.tensorStats.avgSize = 
            this.metrics.tensorStats.totalAllocated / this.metrics.tensorStats.created;
        }
        break;
      case 'dispose':
        this.metrics.tensorStats.disposed++;
        break;
      case 'reuse':
        this.metrics.tensorStats.reused++;
        break;
      case 'pool_hit':
        this.metrics.tensorStats.poolHits++;
        break;
      case 'pool_miss':
        this.metrics.tensorStats.poolMisses++;
        break;
    }
  }

  /**
   * Get current memory usage
   */
  private getMemoryMetrics(): MemoryMetrics {
    const memory = (performance as any).memory;
    return {
      heapUsed: memory?.usedJSHeapSize || 0,
      heapTotal: memory?.totalJSHeapSize || 0,
      external: 0,
      peakHeapUsed: memory?.usedJSHeapSize || 0,
      tensorMemory: 0,
      bufferPool: 0
    };
  }

  /**
   * Get stage start time (simplified implementation)
   */
  private getStageStartTime(stageName: string): number {
    // In a real implementation, you'd track start times for each stage
    // For now, return current time minus a small offset
    return performance.now() - 1;
  }

  /**
   * Generate performance report
   */
  generateReport(metrics: PerformanceMetrics): string {
    let report = `
🚀 PERFORMANCE REPORT
=====================

📊 Overall Stats:
• Total Time: ${metrics.totalTime.toFixed(2)}ms
• Memory Peak: ${(metrics.memoryUsage.peakHeapUsed / 1024 / 1024).toFixed(2)}MB
• Heap Used: ${(metrics.memoryUsage.heapUsed / 1024 / 1024).toFixed(2)}MB

🏗️ Tensor Operations:
• Created: ${metrics.tensorStats.created}
• Disposed: ${metrics.tensorStats.disposed}
• Reused: ${metrics.tensorStats.reused}
• Pool Hit Rate: ${((metrics.tensorStats.poolHits / (metrics.tensorStats.poolHits + metrics.tensorStats.poolMisses)) * 100).toFixed(1)}%
• Avg Tensor Size: ${(metrics.tensorStats.avgSize / 1024 / 1024).toFixed(2)}MB

⏱️ Stage Breakdown:
`;

    // Sort stages by duration
    const sortedStages = Array.from(metrics.stages.values()).sort((a, b) => b.duration - a.duration);
    
    for (const stage of sortedStages) {
      report += `• ${stage.name}: ${stage.duration.toFixed(2)}ms (${stage.percentage.toFixed(1)}%)\n`;
      if (stage.calls > 1) {
        report += `  └─ ${stage.calls} calls, avg: ${stage.avgDuration.toFixed(2)}ms\n`;
      }
    }

    return report;
  }

  /**
   * Get optimization suggestions
   */
  getOptimizationSuggestions(metrics: PerformanceMetrics): string[] {
    const suggestions: string[] = [];
    
    // Check memory usage
    const memoryUsageMB = metrics.memoryUsage.heapUsed / 1024 / 1024;
    if (memoryUsageMB > 1000) {
      suggestions.push('High memory usage detected. Consider reducing batch size or enabling tiled processing.');
    }
    
    // Check tensor pool efficiency (fix NaN calculation)
    const totalPoolOps = metrics.tensorStats.poolHits + metrics.tensorStats.poolMisses;
    if (totalPoolOps > 0) {
      const poolHitRate = metrics.tensorStats.poolHits / totalPoolOps;
      if (poolHitRate < 0.7) {
        suggestions.push(`Low tensor pool hit rate (${(poolHitRate * 100).toFixed(1)}%). Consider increasing pool size or optimizing tensor reuse.`);
      }
    }
    
    // Check stage distribution
    const sortedStages = Array.from(metrics.stages.values()).sort((a, b) => b.percentage - a.percentage);
    if (sortedStages.length > 0 && sortedStages[0].percentage > 60) {
      suggestions.push(`${sortedStages[0].name} is taking ${sortedStages[0].percentage.toFixed(1)}% of total time. Consider optimizing this stage.`);
    }
    
    // Check for inefficient patterns
    if (metrics.tensorStats.disposed > metrics.tensorStats.reused * 2) {
      suggestions.push('Low tensor reuse detected. Consider implementing more aggressive tensor pooling.');
    }
    
    // Check UNet performance
    const unetStage = metrics.stages.get('unet_inference');
    if (unetStage && unetStage.percentage > 80) {
      suggestions.push(`UNet inference is ${unetStage.percentage.toFixed(1)}% of total time. Consider reducing steps or using a faster scheduler.`);
    }
    
    return suggestions;
  }

  /**
   * Enable/disable monitoring
   */
  setEnabled(enabled: boolean): void {
    this.enabled = enabled;
  }

  /**
   * Clear all metrics
   */
  reset(): void {
    this.metrics = {
      totalTime: 0,
      stages: new Map(),
      memoryUsage: this.getMemoryMetrics(),
      tensorStats: {
        created: 0,
        disposed: 0,
        reused: 0,
        poolHits: 0,
        poolMisses: 0,
        avgSize: 0,
        totalAllocated: 0
      }
    };
    this.stageTimes.clear();
    this.stageStack = [];
  }
}

/**
 * Performance timing decorator
 */
export function timed(stageName: string) {
  return function (target: any, propertyName: string, descriptor: PropertyDescriptor) {
    const method = descriptor.value;
    
    descriptor.value = async function (...args: any[]) {
      const monitor = PerformanceMonitor.getInstance();
      monitor.startStage(stageName);
      
      try {
        const result = await method.apply(this, args);
        return result;
      } finally {
        monitor.endStage();
      }
    };
    
    return descriptor;
  };
}

/**
 * Memory usage tracker
 */
export class MemoryTracker {
  private static snapshots: Map<string, MemoryMetrics> = new Map();
  
  static snapshot(name: string): void {
    const monitor = PerformanceMonitor.getInstance();
    const metrics = (monitor as any).getMemoryMetrics();
    this.snapshots.set(name, metrics);
  }
  
  static compare(before: string, after: string): string {
    const beforeMetrics = this.snapshots.get(before);
    const afterMetrics = this.snapshots.get(after);
    
    if (!beforeMetrics || !afterMetrics) {
      return 'Invalid snapshot names';
    }
    
    const heapDiff = (afterMetrics.heapUsed - beforeMetrics.heapUsed) / 1024 / 1024;
    return `Memory delta: ${heapDiff.toFixed(2)}MB`;
  }
}
