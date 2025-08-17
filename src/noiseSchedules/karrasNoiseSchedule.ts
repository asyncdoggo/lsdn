import { BaseNoiseSchedule } from './baseNoiseSchedule';
import type { NoiseScheduleResult } from './baseNoiseSchedule';

/**
 * Karras noise schedule from "Elucidating the Design Space of Diffusion-Based Generative Models"
 * This schedule provides better distribution of noise levels compared to linear schedules
 */
export class KarrasNoiseSchedule extends BaseNoiseSchedule {
  private rho: number;

  constructor(
    sigmaMin: number = 0.0292, 
    sigmaMax: number = 14.6146, 
    numTrainTimesteps: number = 1000,
    rho: number = 7.0
  ) {
    super(sigmaMin, sigmaMax, numTrainTimesteps);
    this.rho = rho;
  }

  get name(): string {
    return 'Karras';
  }

  /**
   * Generate Karras-style sigma schedule
   * Formula: sigma = (sigmaMax^(1/rho) + t * (sigmaMin^(1/rho) - sigmaMax^(1/rho)))^rho
   */
  generateSchedule(steps: number): NoiseScheduleResult {
    const sigmas: number[] = [];
    const timesteps: number[] = [];
    
    // Generate Karras sigmas using proper exponential schedule
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1); // t goes from 0 to 1
      const minInvRho = this.sigmaMin ** (1 / this.rho);
      const maxInvRho = this.sigmaMax ** (1 / this.rho);
      const sigma = (maxInvRho + t * (minInvRho - maxInvRho)) ** this.rho;
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
   * Set Karras-specific parameters
   */
  setKarrasParameters(rho?: number): void {
    if (rho !== undefined) this.rho = rho;
  }

  /**
   * Get current rho parameter
   */
  getRho(): number {
    return this.rho;
  }
}
