import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';
import { BaseNoiseSchedule, KarrasNoiseSchedule, LinearNoiseSchedule, ExponentialNoiseSchedule } from '../noiseSchedules';
import type { NoiseScheduleType } from '../noiseSchedules';

export class DPMpp2MSdeScheduler extends BaseScheduler {
  private noiseSchedule: BaseNoiseSchedule;
  private timesteps: number[] = [];
  private sigmas: number[] = [];
  private eta: number = 1.0; // SDE noise scale
  
  // For second-order methods, we need to store the previous model output
  private prevModelOutput: ort.Tensor | null = null;

  constructor(noiseScheduleType: NoiseScheduleType = 'karras') {
    super();
    this.noiseSchedule = this.createNoiseSchedule(noiseScheduleType);
  }

  get name(): string {
    return `DPM++ 2M SDE (${this.noiseSchedule.name})`;
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
   * Generate timesteps and sigmas for DPM++ 2M SDE scheduler using the selected noise schedule
   */
  generateTimesteps(steps: number): SchedulerTimesteps {
    const schedule = this.noiseSchedule.generateSchedule(steps);
    this.timesteps = schedule.timesteps;
    this.sigmas = schedule.sigmas;
    
    return { timesteps: this.timesteps, sigmas: this.sigmas };
  }

  /**
   * Scale model inputs according to DPM++ scheduler
   */
  scaleModelInputs(sample: ort.Tensor, timestepIndex: number, sigma?: number): ort.Tensor {
    const inputData = sample.data as Float16Array;
    const outputData = new Float16Array(inputData.length);
    
    const currentSigma = sigma !== undefined ? sigma : this.sigmas[timestepIndex];
    
    // Scale input by (sigma^2 + 1)^0.5 for DPM++ formulation
    const scaleFactor = 1.0 / Math.sqrt(currentSigma ** 2 + 1);
    for (let i = 0; i < inputData.length; i++) {
      outputData[i] = inputData[i] * scaleFactor;
    }
    
    return new ort.Tensor('float16', outputData, sample.dims);
  }

  /**
   * Perform DPM++ 2M SDE scheduler step
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
    
    if (this.prevModelOutput === null || timestepIndex === 0) {
      // First step: use Euler method
      this.prevModelOutput = this.cloneTensor(modelOutput);
      return this.eulerStep(modelOutput, sample, currentSigma, nextSigma);
    } else {
      // Second and subsequent steps: use DPM++ 2M method
      const result = this.dpmpp2mStep(modelOutput, sample, currentSigma, nextSigma, timestepIndex);
      this.prevModelOutput = this.cloneTensor(modelOutput);
      return result;
    }
  }

  /**
   * Euler step for first iteration
   */
  private eulerStep(
    modelOutput: ort.Tensor,
    sample: ort.Tensor,
    sigma: number,
    sigmaNext: number
  ): SchedulerStepResult {
    const outputData = new Float16Array(modelOutput.data.length);
    
    const dt = sigmaNext - sigma;
    
    for (let i = 0; i < modelOutput.data.length; i++) {
      const x = (sample.data as Float16Array)[i];
      const eps = (modelOutput.data as Float16Array)[i];
      
      // Predict original sample: x0 = x - sigma * eps
      const predOrigSample = x - sigma * eps;
      
      // Compute derivative for Euler step (same as Euler-Karras)
      const derivative = (x - predOrigSample) / sigma;
      
      // Add SDE noise if eta > 0 and sigmaNext > 0
      let noise = 0;
      if (this.eta > 0 && sigmaNext > 0) {
        // Compute SDE noise variance
        const noiseVariance = this.eta ** 2 * (sigmaNext ** 2 - sigma ** 2 * (sigmaNext / sigma) ** 2);
        if (noiseVariance > 0) {
          noise = Math.sqrt(noiseVariance) * this.randomNormal();
        }
      }
      
      // Apply Euler step: x_new = x + derivative * dt + noise
      outputData[i] = x + derivative * dt + noise;
    }

    return { prevSample: new ort.Tensor('float16', outputData, modelOutput.dims) };
  }

  /**
   * DPM++ 2M step for second-order accuracy
   */
  private dpmpp2mStep(
    modelOutput: ort.Tensor,
    sample: ort.Tensor,
    sigma: number,
    sigmaNext: number,
    timestepIndex: number
  ): SchedulerStepResult {
    const outputData = new Float16Array(modelOutput.data.length);
    
    // Get previous sigma for second-order calculation
    const sigmaPrev = this.sigmas[timestepIndex - 1];
    
    const dt = sigmaNext - sigma;
    const dtPrev = sigma - sigmaPrev;
    
    for (let i = 0; i < modelOutput.data.length; i++) {
      const x = (sample.data as Float16Array)[i];
      const eps = (modelOutput.data as Float16Array)[i];
      const epsPrev = (this.prevModelOutput!.data as Float16Array)[i];
      
      // Predict x0 using current and previous model outputs
      const x0 = x - sigma * eps;
      const x0Prev = x - sigmaPrev * epsPrev;
      
      // Compute derivatives
      const derivative = (x - x0) / sigma;
      const derivativePrev = (x - x0Prev) / sigmaPrev;
      
      // Second-order correction using linear extrapolation
      const r = dt / dtPrev;
      const correctedDerivative = derivative + r * (derivative - derivativePrev);
      
      // Add SDE noise if eta > 0
      let noise = 0;
      if (this.eta > 0 && sigmaNext > 0) {
        const noiseVariance = this.eta ** 2 * (sigmaNext ** 2 - sigma ** 2 * (sigmaNext / sigma) ** 2);
        if (noiseVariance > 0) {
          noise = Math.sqrt(noiseVariance) * this.randomNormal();
        }
      }
      
      // Apply second-order step
      outputData[i] = x + correctedDerivative * dt + noise;
    }

    return { prevSample: new ort.Tensor('float16', outputData, modelOutput.dims) };
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
    eta?: number
  ): void {
    // Update noise schedule parameters
    this.noiseSchedule.setParameters(sigmaMin, sigmaMax);
    
    // Update Karras-specific parameters if using Karras schedule
    if (this.noiseSchedule instanceof KarrasNoiseSchedule && rho !== undefined) {
      (this.noiseSchedule as KarrasNoiseSchedule).setKarrasParameters(rho);
    }
    
    // Update SDE parameter
    if (eta !== undefined) this.eta = eta;
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

  /**
   * Reset scheduler state for new generation
   */
  reset(): void {
    this.prevModelOutput = null;
  }

  /**
   * Clone a tensor for storing previous model output
   */
  private cloneTensor(tensor: ort.Tensor): ort.Tensor {
    const clonedData = new Float16Array(tensor.data as Float16Array);
    return new ort.Tensor('float16', clonedData, tensor.dims);
  }

  /**
   * Generate random normal distributed number using Box-Muller transform
   */
  private randomNormal(): number {
    let u = 0, v = 0;
    while(u === 0) u = Math.random(); // Converting [0,1) to (0,1)
    while(v === 0) v = Math.random();
    
    const normal = Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
    return normal;
  }
}
