import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';

export class EulerKarrasScheduler extends BaseScheduler {
  private sigmaMin: number = 0.0292;
  private sigmaMax: number = 14.6146;
  private rho: number = 7.0;
  private timesteps: number[] = [];
  private sigmas: number[] = [];

  get name(): string {
    return 'Euler-Karras';
  }

  /**
   * Generate timesteps and sigmas for Euler-Karras scheduler
   */
  generateTimesteps(steps: number): SchedulerTimesteps {
    this.timesteps = [];
    this.sigmas = [];
    
    // Generate karras sigmas using proper exponential schedule
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const minInvRho = this.sigmaMin ** (1 / this.rho);
      const maxInvRho = this.sigmaMax ** (1 / this.rho);
      const sigma = (maxInvRho + t * (minInvRho - maxInvRho)) ** this.rho;
      this.sigmas.push(sigma);
      
      // Convert sigma to timestep (reverse mapping from high to low)
      const timestep = this.numTrainTimesteps - 1 - Math.floor((this.numTrainTimesteps - 1) * t);
      this.timesteps.push(timestep);
    }
    
    // Add final sigma of 0
    this.sigmas.push(0);
    
    return { timesteps: this.timesteps, sigmas: this.sigmas };
  }

  /**
   * Scale model inputs according to Euler-Karras scheduler
   */
  scaleModelInputs(sample: ort.Tensor, timestepIndex: number, sigma?: number): ort.Tensor {
    const inputData = sample.data as Float16Array;
    const outputData = new Float16Array(inputData.length);
    
    const currentSigma = sigma !== undefined ? sigma : this.sigmas[timestepIndex];
    
    // Scale input by sigma for Euler-Karras
    const scaleFactor = 1.0 / Math.sqrt(currentSigma ** 2 + 1);
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * scaleFactor;
    }
    
    return new ort.Tensor('float16', outputData, sample.dims);
  }

  /**
   * Perform Euler-Karras scheduler step
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
  setParameters(sigmaMin?: number, sigmaMax?: number, rho?: number): void {
    if (sigmaMin !== undefined) this.sigmaMin = sigmaMin;
    if (sigmaMax !== undefined) this.sigmaMax = sigmaMax;
    if (rho !== undefined) this.rho = rho;
  }
}
