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
  generateSchedule(
    steps: number,
    opts?: { rho?: number; blend?: number }
  ): NoiseScheduleResult {
    const rho = opts?.rho ?? 7;        // skew control
    const blend = opts?.blend ?? 0.4; // 0: geometric … 1: true Karras

    const sigmas: number[] = [];
    const timesteps: number[] = [];

    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const tEff = (1 - blend) * t + blend * Math.pow(t, rho);
      const sigma = this.sigmaMax * Math.pow(this.sigmaMin / this.sigmaMax, tEff);
      sigmas.push(sigma);

      // fractional timestep mapping (hi→lo)
      const timestep = (1 - t) * (this.numTrainTimesteps - 1);
      timesteps.push(timestep);
    }
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
