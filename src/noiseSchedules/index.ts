import { BaseNoiseSchedule } from './baseNoiseSchedule';
import { KarrasNoiseSchedule } from './karrasNoiseSchedule';
import { LinearNoiseSchedule } from './linearNoiseSchedule';
import { ExponentialNoiseSchedule } from './exponentialNoiseSchedule';

export { BaseNoiseSchedule } from './baseNoiseSchedule';
export type { NoiseScheduleParams, NoiseScheduleResult } from './baseNoiseSchedule';
export { KarrasNoiseSchedule } from './karrasNoiseSchedule';
export { LinearNoiseSchedule } from './linearNoiseSchedule';
export { ExponentialNoiseSchedule } from './exponentialNoiseSchedule';

// Noise schedule types for easy reference
export type NoiseScheduleType = 'karras' | 'linear' | 'exponential';

// Factory function to create noise schedules
export function createNoiseSchedule(
  type: NoiseScheduleType,
  sigmaMin?: number,
  sigmaMax?: number,
  numTrainTimesteps?: number,
  extraParams?: Record<string, number>
): BaseNoiseSchedule {
  switch (type) {
    case 'karras':
      return new KarrasNoiseSchedule(
        sigmaMin,
        sigmaMax,
        numTrainTimesteps,
        extraParams?.rho
      );
    case 'linear':
      return new LinearNoiseSchedule(sigmaMin, sigmaMax, numTrainTimesteps);
    case 'exponential':
      return new ExponentialNoiseSchedule(
        sigmaMin,
        sigmaMax,
        numTrainTimesteps,
        extraParams?.beta
      );
    default:
      throw new Error(`Unknown noise schedule type: ${type}`);
  }
}
