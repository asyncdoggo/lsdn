import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';
import { BaseNoiseSchedule, KarrasNoiseSchedule, LinearNoiseSchedule, ExponentialNoiseSchedule } from '../noiseSchedules';
import type { NoiseScheduleType } from '../noiseSchedules';

export class EulerScheduler extends BaseScheduler {
  private noiseSchedule: BaseNoiseSchedule;
  private timesteps: number[] = [];
  private sigmas: number[] = [];

  constructor(noiseScheduleType: NoiseScheduleType = 'karras') {
    super();
    this.noiseSchedule = this.createNoiseSchedule(noiseScheduleType);
  }

  get name(): string {
    return `Euler (${this.noiseSchedule.name})`;
  }

  /**
   * Create noise schedule based on type
   */
  private createNoiseSchedule(type: NoiseScheduleType): BaseNoiseSchedule {
    switch (type) {
      case 'karras':
        return new KarrasNoiseSchedule();
      case 'linear':
        return new LinearNoiseSchedule();
      case 'exponential':
        return new ExponentialNoiseSchedule();
      default:
        return new KarrasNoiseSchedule();
    }
  }

  /**
   * Generate timesteps and sigmas for Euler scheduler
   */
  generateTimesteps(steps: number): SchedulerTimesteps {
    const schedule = this.noiseSchedule.generateSchedule(steps);
    this.timesteps = schedule.timesteps;
    this.sigmas = schedule.sigmas;
    
    return { timesteps: this.timesteps, sigmas: this.sigmas };
  }

  /**
   * Scale model inputs according to Euler scheduler
   */
  scaleModelInputs(sample: ort.Tensor, timestepIndex: number, sigma?: number): ort.Tensor {
    const inputData = sample.data as Float16Array;
    const outputData = new Float16Array(inputData.length);
    
    const currentSigma = sigma !== undefined ? sigma : this.sigmas[timestepIndex];
    
    // Scale input by sigma for Euler method
    const scaleFactor = 1.0 / Math.sqrt(currentSigma ** 2 + 1);
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * scaleFactor;
    }
    
    return new ort.Tensor('float16', outputData, sample.dims);
  }

  /**
   * Perform Euler scheduler step
   */
  step(
    modelOutput: ort.Tensor, 
    sample: ort.Tensor, 
    timestepIndex: number,
    sigma?: number,
    sigmaNext?: number
  ): SchedulerStepResult {
    const currentSigma = sigma !== undefined ? sigma : this.sigmas[timestepIndex];
    const nextSigma = sigmaNext !== undefined ? sigmaNext : this.sigmas[timestepIndex + 1];
    
    const outputData = new Float16Array(modelOutput.data.length);
    
    // For diffusion models, the model output is the predicted noise
    const dt = nextSigma - currentSigma;
    
    for (let i = 0; i < modelOutput.data.length; i++) {
      // Compute the derivative: d_x = (x - sigma * eps) / sigma
      const x = (sample.data as Float16Array)[i];
      const eps = (modelOutput.data as Float16Array)[i];
      
      // Predict original sample
      const predOrigSample = x - currentSigma * eps;
      
      // Compute derivative for Euler step
      const derivative = (x - predOrigSample) / currentSigma;
      
      // Apply Euler step: x_new = x + derivative * dt
      outputData[i] = x + derivative * dt;
    }

    const prevSample = new ort.Tensor('float16', outputData, modelOutput.dims);
    return { prevSample };
  }

  /**
   * Scale initial noise according to the scheduler
   */
  scaleInitialNoise(noise: ort.Tensor, timesteps: SchedulerTimesteps): ort.Tensor {
    const scaledData = new Float16Array(noise.data.length);
    const initialSigma = timesteps.sigmas[0];
    
    for (let i = 0; i < noise.data.length; i++) {
      scaledData[i] = (noise.data as Float16Array)[i] * initialSigma;
    }
    
    return new ort.Tensor('float16', scaledData, noise.dims);
  }

  /**
   * Set scheduler parameters
   */
  setParameters(
    sigmaMin?: number, 
    sigmaMax?: number, 
    rho?: number,
    beta?: number
  ): void {
    // Update noise schedule parameters
    this.noiseSchedule.setParameters(sigmaMin, sigmaMax);
    
    // Update schedule-specific parameters
    if (this.noiseSchedule instanceof KarrasNoiseSchedule && rho !== undefined) {
      (this.noiseSchedule as KarrasNoiseSchedule).setKarrasParameters(rho);
    }
    
    // Handle exponential schedule parameters
    if (this.noiseSchedule.name === 'Exponential' && beta !== undefined) {
      (this.noiseSchedule as any).setExponentialParameters(beta);
    }
  }

  /**
   * Set noise schedule type
   */
  setNoiseSchedule(type: NoiseScheduleType): void {
    this.noiseSchedule = this.createNoiseSchedule(type);
  }

  /**
   * Get current noise schedule type
   */
  getNoiseScheduleName(): string {
    return this.noiseSchedule.name;
  }
}
