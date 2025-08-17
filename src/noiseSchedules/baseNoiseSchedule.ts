/**
 * Base interface for noise schedules
 * Noise schedules determine how sigma values are distributed across timesteps
 */
export interface NoiseScheduleParams {
  sigmaMin: number;
  sigmaMax: number;
  steps: number;
}

export interface NoiseScheduleResult {
  sigmas: number[];
  timesteps: number[];
}

export abstract class BaseNoiseSchedule {
  protected sigmaMin: number;
  protected sigmaMax: number;
  protected numTrainTimesteps: number;

  constructor(sigmaMin: number = 0.0292, sigmaMax: number = 14.6146, numTrainTimesteps: number = 1000) {
    this.sigmaMin = sigmaMin;
    this.sigmaMax = sigmaMax;
    this.numTrainTimesteps = numTrainTimesteps;
  }

  /**
   * Generate sigmas and timesteps for the given number of steps
   */
  abstract generateSchedule(steps: number): NoiseScheduleResult;

  /**
   * Get the name of this noise schedule
   */
  abstract get name(): string;

  /**
   * Update schedule parameters
   */
  setParameters(sigmaMin?: number, sigmaMax?: number, numTrainTimesteps?: number): void {
    if (sigmaMin !== undefined) this.sigmaMin = sigmaMin;
    if (sigmaMax !== undefined) this.sigmaMax = sigmaMax;
    if (numTrainTimesteps !== undefined) this.numTrainTimesteps = numTrainTimesteps;
  }
}
