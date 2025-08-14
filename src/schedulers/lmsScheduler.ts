import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';

export class LMSScheduler extends BaseScheduler {
  private sigmaMin: number = 0.0292;
  private sigmaMax: number = 14.6146;
  private rho: number = 7.0;
  private order: number = 4; // LMS order (1-4, higher is more accurate but requires more memory)
  private timesteps: number[] = [];
  private sigmas: number[] = [];
  private derivatives: ort.Tensor[] = []; // Store previous derivatives for multi-step

  get name(): string {
    return `LMS-${this.order}`;
  }

  /**
   * Generate timesteps and sigmas for LMS scheduler using Karras noise schedule
   */
  generateTimesteps(steps: number): SchedulerTimesteps {
    this.timesteps = [];
    this.sigmas = [];
    this.derivatives = []; // Reset derivatives for new generation
    
    // Generate karras sigmas (same as Euler-Karras for consistency)
    for (let i = 0; i < steps; i++) {
      const t = i / (steps - 1);
      const minInvRho = this.sigmaMin ** (1 / this.rho);
      const maxInvRho = this.sigmaMax ** (1 / this.rho);
      const sigma = (maxInvRho + t * (minInvRho - maxInvRho)) ** this.rho;
      this.sigmas.push(sigma);
      
      // Convert sigma to timestep
      const timestep = this.numTrainTimesteps - 1 - Math.floor((this.numTrainTimesteps - 1) * t);
      this.timesteps.push(timestep);
    }
    
    // Add final sigma of 0
    this.sigmas.push(0);
    
    return { timesteps: this.timesteps, sigmas: this.sigmas };
  }

  /**
   * Scale model inputs according to LMS scheduler
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
   * Perform LMS scheduler step using linear multi-step method
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
    
    // Calculate the derivative (same as Euler method)
    const derivative = this.calculateDerivative(modelOutput, sample, currentSigma);
    
    // Store the current derivative for future steps
    this.derivatives.push(derivative);
    
    // Keep only the most recent 'order' derivatives
    if (this.derivatives.length > this.order) {
      this.derivatives.shift();
    }
    
    // If we don't have enough derivatives yet, fall back to Euler method
    if (this.derivatives.length === 1) {
      return this.eulerStep(sample, derivative, currentSigma, nextSigma);
    }
    
    // Apply LMS method based on available derivatives
    return this.lmsStep(sample, currentSigma, nextSigma);
  }

  /**
   * Calculate derivative for current step
   */
  private calculateDerivative(modelOutput: ort.Tensor, sample: ort.Tensor, sigma: number): ort.Tensor {
    const outputData = new Float16Array(modelOutput.data.length);
    
    for (let i = 0; i < modelOutput.data.length; i++) {
      const x = (sample.data as Float16Array)[i];
      const eps = (modelOutput.data as Float16Array)[i];
      
      // Predict original sample
      const predOrigSample = x - sigma * eps;
      
      // Compute derivative
      outputData[i] = (x - predOrigSample) / sigma;
    }
    
    return new ort.Tensor('float16', outputData, modelOutput.dims);
  }

  /**
   * Perform Euler step (used as fallback for first step)
   */
  private eulerStep(sample: ort.Tensor, derivative: ort.Tensor, currentSigma: number, nextSigma: number): SchedulerStepResult {
    const outputData = new Float16Array(sample.data.length);
    const dt = nextSigma - currentSigma;
    
    for (let i = 0; i < sample.data.length; i++) {
      const x = (sample.data as Float16Array)[i];
      const d = (derivative.data as Float16Array)[i];
      outputData[i] = x + d * dt;
    }
    
    const prevSample = new ort.Tensor('float16', outputData, sample.dims);
    return { prevSample };
  }

  /**
   * Perform LMS step using Adams-Bashforth coefficients
   */
  private lmsStep(sample: ort.Tensor, currentSigma: number, nextSigma: number): SchedulerStepResult {
    const outputData = new Float16Array(sample.data.length);
    const dt = nextSigma - currentSigma;
    const numDerivatives = this.derivatives.length;
    
    // Adams-Bashforth coefficients for different orders
    const coefficients = this.getAdamsBashforthCoefficients(numDerivatives);
    
    for (let i = 0; i < sample.data.length; i++) {
      let weightedDerivativeSum = 0;
      
      // Apply weighted sum of derivatives (most recent first)
      for (let j = 0; j < numDerivatives; j++) {
        const derivativeIndex = numDerivatives - 1 - j; // Reverse order for most recent first
        const derivative = (this.derivatives[derivativeIndex].data as Float16Array)[i];
        weightedDerivativeSum += coefficients[j] * derivative;
      }
      
      const x = (sample.data as Float16Array)[i];
      outputData[i] = x + dt * weightedDerivativeSum;
    }
    
    const prevSample = new ort.Tensor('float16', outputData, sample.dims);
    return { prevSample };
  }

  /**
   * Get Adams-Bashforth coefficients for linear multi-step method
   */
  private getAdamsBashforthCoefficients(order: number): number[] {
    switch (order) {
      case 1:
        return [1.0]; // Euler method
      case 2:
        return [3/2, -1/2]; // 2nd order
      case 3:
        return [23/12, -16/12, 5/12]; // 3rd order
      case 4:
      default:
        return [55/24, -59/24, 37/24, -9/24]; // 4th order
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
   * Set LMS scheduler parameters
   */
  setParameters(sigmaMin?: number, sigmaMax?: number, rho?: number, order?: number): void {
    if (sigmaMin !== undefined) this.sigmaMin = sigmaMin;
    if (sigmaMax !== undefined) this.sigmaMax = sigmaMax;
    if (rho !== undefined) this.rho = rho;
    if (order !== undefined && order >= 1 && order <= 4) {
      this.order = order;
      // Reset derivatives when order changes
      this.derivatives = [];
    }
  }

  /**
   * Get current order
   */
  getOrder(): number {
    return this.order;
  }

  /**
   * Reset internal state (useful when starting a new generation)
   */
  reset(): void {
    this.derivatives = [];
  }
}
