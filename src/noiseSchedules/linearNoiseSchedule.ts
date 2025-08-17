import { BaseNoiseSchedule } from './baseNoiseSchedule';
import type { NoiseScheduleResult } from './baseNoiseSchedule';

/**
 * Linear noise schedule - linear interpolation in log-space between sigmaMax and sigmaMin
 * This provides better distribution than simple linear interpolation
 */
export class LinearNoiseSchedule extends BaseNoiseSchedule {
  get name(): string {
    return 'Linear';
  }

  /**
   * Generate linear sigma schedule in log-space for better distribution
   * Formula: log(sigma) = log(sigmaMax) - t * (log(sigmaMax) - log(sigmaMin))
   */
  generateSchedule(steps: number): NoiseScheduleResult {
    const sigmas: number[] = [];
    const timesteps: number[] = [];
    
    // Generate linearly spaced sigmas in log space for better distribution
    const logSigmaMin = Math.log(this.sigmaMin);
    const logSigmaMax = Math.log(this.sigmaMax);
    
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1); // t goes from 0 to 1
      const logSigma = logSigmaMax - t * (logSigmaMax - logSigmaMin);
      const sigma = Math.exp(logSigma);
      sigmas.push(sigma);
      
      // Convert to timestep (reverse mapping from high to low)
      const timestep = this.numTrainTimesteps - 1 - Math.floor((this.numTrainTimesteps - 1) * t);
      timesteps.push(timestep);
    }
    
    // Add final sigma of 0
    sigmas.push(0);
    
    return { sigmas, timesteps };
  }
}
