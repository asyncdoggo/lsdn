import { BaseNoiseSchedule } from './baseNoiseSchedule';
import type { NoiseScheduleResult } from './baseNoiseSchedule';

/**
 * Exponential noise schedule - cosine-based exponential decay from sigmaMax to sigmaMin
 * Provides smoother transitions and better noise distribution
 */
export class ExponentialNoiseSchedule extends BaseNoiseSchedule {
  private beta: number;

  constructor(
    sigmaMin: number = 0.0292, 
    sigmaMax: number = 14.6146, 
    numTrainTimesteps: number = 1000,
    beta: number = 1.0
  ) {
    super(sigmaMin, sigmaMax, numTrainTimesteps);
    this.beta = beta;
  }

  get name(): string {
    return 'Exponential';
  }

  /**
   * Generate exponential sigma schedule using cosine-like decay
   * Formula: sigma = sigmaMin + 0.5 * (sigmaMax - sigmaMin) * (1 + cos(pi * t^beta))
   */
  generateSchedule(steps: number): NoiseScheduleResult {
    const sigmas: number[] = [];
    const timesteps: number[] = [];
    
    // Generate exponentially decaying sigmas using cosine schedule
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1); // t goes from 0 to 1
      
      // Use cosine-based exponential decay for smoother transitions
      const cosineDecay = 0.5 * (1 + Math.cos(Math.PI * Math.pow(t, this.beta)));
      const sigma = this.sigmaMin + (this.sigmaMax - this.sigmaMin) * cosineDecay;
      sigmas.push(sigma);
      
      // Convert to timestep (reverse mapping from high to low)
      const timestep = this.numTrainTimesteps - 1 - Math.floor((this.numTrainTimesteps - 1) * t);
      timesteps.push(timestep);
    }
    
    // Add final sigma of 0
    sigmas.push(0);
    
    return { sigmas, timesteps };
  }

  /**
   * Set exponential-specific parameters
   */
  setExponentialParameters(beta?: number): void {
    if (beta !== undefined) this.beta = beta;
  }

  /**
   * Get current beta parameter
   */
  getBeta(): number {
    return this.beta;
  }
}
