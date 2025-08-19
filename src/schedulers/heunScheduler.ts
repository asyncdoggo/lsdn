import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';
import { KarrasNoiseSchedule } from '../noiseSchedules';

export class HeunScheduler extends BaseScheduler {
  private sigmaMin: number = 0.0292;
  private sigmaMax: number = 14.6146;
  private rho: number = 7.0;
  private noiseSchedule: KarrasNoiseSchedule;
  private timesteps: number[] = [];
  private sigmas: number[] = [];
  private lastDerivative: ort.Tensor | null = null; // Store previous derivative for second-order method

  constructor() {
    super();
    this.noiseSchedule = new KarrasNoiseSchedule(this.sigmaMin, this.sigmaMax, 1000, this.rho);
  }

  get name(): string {
    return 'Heun';
  }

  /**
   * Generate timesteps and sigmas for Heun scheduler using Karras noise schedule
   */
  generateTimesteps(steps: number): SchedulerTimesteps {
    const schedule = this.noiseSchedule.generateSchedule(steps);
    this.timesteps = schedule.timesteps;
    this.sigmas = schedule.sigmas;
    
    // Reset state for new generation
    this.reset();

    return { timesteps: this.timesteps, sigmas: this.sigmas };    
  }

  /**
   * Scale model inputs according to Heun scheduler
   */
  scaleModelInputs(sample: ort.Tensor, timestepIndex: number, sigma?: number): ort.Tensor {
    const inputData = sample.data as Float16Array;
    const outputData = new Float16Array(inputData.length);
    
    const currentSigma = sigma !== undefined ? sigma : this.sigmas[timestepIndex];
    
    // Scale input by sigma (same as Euler)
    const scaleFactor = 1.0 / Math.sqrt(currentSigma ** 2 + 1);
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * scaleFactor;
    }
    
    return new ort.Tensor('float16', outputData, sample.dims);
  }

  /**
   * Perform Heun scheduler step using predictor-corrector method
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
    
    if (this.lastDerivative === null || timestepIndex === 0) {
      // First step: Euler method (same as Euler-Karras)
      for (let i = 0; i < modelOutput.data.length; i++) {
        const x = (sample.data as Float16Array)[i];
        const eps = (modelOutput.data as Float16Array)[i];
        
        // Standard diffusion step: x_{t-1} = x_t + (sigma_{t-1} - sigma_t) * eps
        const step = (nextSigma - currentSigma) * eps;
        outputData[i] = x + step;
      }
      
      // Store this noise prediction for next iteration
      const derivativeData = new Float16Array(modelOutput.data.length);
      for (let i = 0; i < modelOutput.data.length; i++) {
        derivativeData[i] = (modelOutput.data as Float16Array)[i];
      }
      this.lastDerivative = new ort.Tensor('float16', derivativeData, modelOutput.dims);
      
      const prevSample = new ort.Tensor('float16', outputData, modelOutput.dims);
      return { prevSample };
    } else {
      // Second step: Heun's method (average current and previous noise predictions)
      for (let i = 0; i < modelOutput.data.length; i++) {
        const x = (sample.data as Float16Array)[i];
        const currentEps = (modelOutput.data as Float16Array)[i];
        const prevEps = (this.lastDerivative.data as Float16Array)[i];
        
        // Average the noise predictions
        const avgEps = (prevEps + currentEps) / 2;
        
        // Apply averaged step
        const step = (nextSigma - currentSigma) * avgEps;
        outputData[i] = x + step;
      }
      
      // Update stored derivative
      const derivativeData = new Float16Array(modelOutput.data.length);
      for (let i = 0; i < modelOutput.data.length; i++) {
        derivativeData[i] = (modelOutput.data as Float16Array)[i];
      }
      
      if (this.lastDerivative) {
        this.lastDerivative = new ort.Tensor('float16', derivativeData, modelOutput.dims);
      }
      
      const prevSample = new ort.Tensor('float16', outputData, modelOutput.dims);
      return { prevSample };
    }
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
   * Set Heun scheduler parameters
   */
  setParameters(sigmaMin?: number, sigmaMax?: number, rho?: number): void {
    if (sigmaMin !== undefined) this.sigmaMin = sigmaMin;
    if (sigmaMax !== undefined) this.sigmaMax = sigmaMax;
    if (rho !== undefined) this.rho = rho;
  }

  /**
   * Reset internal state (useful when starting a new generation)
   */
  reset(): void {
    this.lastDerivative = null;
  }
}
