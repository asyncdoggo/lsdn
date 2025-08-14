import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';

export class DPMSolverMultistepScheduler extends BaseScheduler {
  // Simplified configuration parameters
  private betaEnd: number = 0.012;
  private betaSchedule: string = 'scaled_linear';
  private betaStart: number = 0.00085;
  protected numTrainTimesteps: number = 1000;

  // Internal state
  private betas: number[] = [];
  private alphasCumprod: number[] = [];
  private timesteps: number[] = [];
  private sigmas: number[] = [];

  get name(): string {
    return 'DPM-Solver Multistep';
  }

  /**
   * Generate timesteps and noise schedule for DPM-Solver
   */
  generateTimesteps(steps: number): SchedulerTimesteps {
    this.timesteps = [];
    this.betas = [];
    this.alphasCumprod = [];
    this.sigmas = [];

    // Generate beta schedule (same as DDPM)
    if (this.betaSchedule === 'scaled_linear') {
      const start = Math.sqrt(this.betaStart);
      const end = Math.sqrt(this.betaEnd);
      for (let i = 0; i < this.numTrainTimesteps; i++) {
        const beta_t = start + (end - start) * i / (this.numTrainTimesteps - 1);
        this.betas.push(beta_t * beta_t);
      }
    }

    // Compute alphas_cumprod (same as DDPM)
    for (let i = 0; i < this.numTrainTimesteps; i++) {
      const alpha = 1.0 - this.betas[i];
      if (i === 0) {
        this.alphasCumprod.push(alpha);
      } else {
        this.alphasCumprod.push(this.alphasCumprod[i - 1] * alpha);
      }
    }

    // Generate evenly spaced timesteps in descending order (like DDPM but different spacing)
    for (let i = 0; i < steps; i++) {
      // Use the same approach as DDPM but with potentially better distribution
      const timestep = Math.floor((this.numTrainTimesteps - 1) * (steps - 1 - i) / (steps - 1));
      this.timesteps.push(timestep);
    }

    // Debug: log the first few timesteps to make sure they look reasonable
    console.log(`DPM-Solver timesteps (first 5): ${this.timesteps.slice(0, 5)}`);

    // Compute sigmas
    for (const t of this.timesteps) {
      const alphaCumprod = this.alphasCumprod[t];
      const sigma = Math.sqrt((1 - alphaCumprod) / alphaCumprod);
      this.sigmas.push(sigma);
    }

    // Debug: log the first few sigmas
    console.log(`DPM-Solver sigmas (first 5): ${this.sigmas.slice(0, 5)}`);

    // Add final sigma of 0
    this.sigmas.push(0);

    return { timesteps: this.timesteps, sigmas: this.sigmas };
  }

  /**
   * Scale model inputs - no scaling needed for this simplified version
   */
  scaleModelInputs(sample: ort.Tensor, _timestepIndex: number, _sigma?: number): ort.Tensor {
    return sample;
  }

  /**
   * Perform DPM-Solver step - now using exact DDPM calculation for debugging
   */
  step(
    modelOutput: ort.Tensor,
    sample: ort.Tensor,
    timestepIndex: number,
    _sigma?: number,
    _sigmaNext?: number
  ): SchedulerStepResult {
    const t = this.timesteps[timestepIndex];
    const prevT = timestepIndex < this.timesteps.length - 1 ? this.timesteps[timestepIndex + 1] : 0;

    const alphaProdT = this.alphasCumprod[t];
    const alphaProdTPrev = prevT >= 0 ? this.alphasCumprod[prevT] : 1.0;
    const betaProdT = 1 - alphaProdT;
    const betaProdTPrev = 1 - alphaProdTPrev;

    const outputData = new Float16Array(modelOutput.data.length);

    // Use exact DDPM formula
    for (let i = 0; i < modelOutput.data.length; i++) {
      const x_t = (sample.data as Float16Array)[i];
      const eps = (modelOutput.data as Float16Array)[i];

      // Predict x_0 from x_t and eps
      const pred_x0 = (x_t - Math.sqrt(betaProdT) * eps) / Math.sqrt(alphaProdT);

      // Compute x_{t-1} using the formula from DDPM paper
      const predPrevSample = Math.sqrt(alphaProdTPrev) * pred_x0 + Math.sqrt(betaProdTPrev) * eps;
      
      outputData[i] = predPrevSample;
    }

    const prevSample = new ort.Tensor('float16', outputData, modelOutput.dims);
    return { prevSample };
  }

  /**
   * Scale initial noise - use the same scaling as Euler-Karras for consistency
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
   * Set DPM-Solver parameters
   */
  setParameters(options: {
    betaStart?: number;
    betaEnd?: number;
    betaSchedule?: string;
  }): void {
    if (options.betaStart !== undefined) this.betaStart = options.betaStart;
    if (options.betaEnd !== undefined) this.betaEnd = options.betaEnd;
    if (options.betaSchedule !== undefined) this.betaSchedule = options.betaSchedule;
  }
}
