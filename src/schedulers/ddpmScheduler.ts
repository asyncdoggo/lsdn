import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';

export class DDPMScheduler extends BaseScheduler {
  private betaStart: number = 0.00085;
  private betaEnd: number = 0.012;
  private betaSchedule: string = 'scaled_linear';
  private timesteps: number[] = [];
  private alphas: number[] = [];
  private alphasCumprod: number[] = [];
  private betas: number[] = [];

  get name(): string {
    return 'DDPM';
  }

  /**
   * Generate timesteps and noise schedule for DDPM
   */
  generateTimesteps(steps: number): SchedulerTimesteps {
    this.timesteps = [];
    this.betas = [];
    this.alphas = [];
    this.alphasCumprod = [];

    // Generate beta schedule
    if (this.betaSchedule === 'linear') {
      for (let i = 0; i < this.numTrainTimesteps; i++) {
        const beta = this.betaStart + (this.betaEnd - this.betaStart) * i / (this.numTrainTimesteps - 1);
        this.betas.push(beta);
      }
    } else if (this.betaSchedule === 'scaled_linear') {
      // Default scaled linear schedule
      const start = Math.sqrt(this.betaStart);
      const end = Math.sqrt(this.betaEnd);
      for (let i = 0; i < this.numTrainTimesteps; i++) {
        const beta_t = start + (end - start) * i / (this.numTrainTimesteps - 1);
        this.betas.push(beta_t * beta_t);
      }
    }

    // Compute alphas and alphas_cumprod
    for (let i = 0; i < this.numTrainTimesteps; i++) {
      const alpha = 1.0 - this.betas[i];
      this.alphas.push(alpha);
      
      if (i === 0) {
        this.alphasCumprod.push(alpha);
      } else {
        this.alphasCumprod.push(this.alphasCumprod[i - 1] * alpha);
      }
    }

    // Generate inference timesteps (evenly spaced, descending from high to low)
    for (let i = 0; i < steps; i++) {
      const timestep = Math.floor((this.numTrainTimesteps - 1) * (steps - 1 - i) / (steps - 1));
      this.timesteps.push(timestep);
    }

    // Convert to sigmas (for compatibility with interface)
    const sigmas = this.timesteps.map(t => Math.sqrt((1 - this.alphasCumprod[t]) / this.alphasCumprod[t]));
    sigmas.push(0); // Final sigma

    return { timesteps: this.timesteps, sigmas };
  }

  /**
   * Scale model inputs (DDPM doesn't require special scaling)
   */
  scaleModelInputs(sample: ort.Tensor, _timestepIndex: number): ort.Tensor {
    // DDPM doesn't require input scaling
    return sample;
  }

  /**
   * Perform DDPM denoising step
   */
  step(
    modelOutput: ort.Tensor,
    sample: ort.Tensor,
    timestepIndex: number
  ): SchedulerStepResult {
    const t = this.timesteps[timestepIndex];
    // For descending timesteps, the "previous" (less noisy) timestep is the next index
    const prevT = timestepIndex < this.timesteps.length - 1 ? this.timesteps[timestepIndex + 1] : 0;

    const alphaProdT = this.alphasCumprod[t];
    const alphaProdTPrev = prevT >= 0 ? this.alphasCumprod[prevT] : 1.0;
    const betaProdT = 1 - alphaProdT;
    const betaProdTPrev = 1 - alphaProdTPrev;

    console.log(`DDPM Step Debug: t=${t}, prevT=${prevT}, alphaProdT=${alphaProdT.toFixed(6)}, alphaProdTPrev=${alphaProdTPrev.toFixed(6)}`);

    const outputData = new Float16Array(modelOutput.data.length);

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
   * Scale initial noise (DDPM starts with standard normal noise)
   */
  scaleInitialNoise(noise: ort.Tensor, _timesteps: SchedulerTimesteps): ort.Tensor {
    // DDPM uses unscaled initial noise
    return noise;
  }

  /**
   * Set DDPM parameters
   */
  setParameters(betaStart?: number, betaEnd?: number, betaSchedule?: string): void {
    if (betaStart !== undefined) this.betaStart = betaStart;
    if (betaEnd !== undefined) this.betaEnd = betaEnd;
    if (betaSchedule !== undefined) this.betaSchedule = betaSchedule;
  }
}
