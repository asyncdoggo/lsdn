import * as ort from 'onnxruntime-web/webgpu';
import { BaseScheduler } from './baseScheduler';
import type { SchedulerTimesteps, SchedulerStepResult } from './baseScheduler';
import { BaseNoiseSchedule, KarrasNoiseSchedule, LinearNoiseSchedule, ExponentialNoiseSchedule } from '../noiseSchedules';
import type { NoiseScheduleType } from '../noiseSchedules';

export class EulerDiscreteScheduler extends BaseScheduler {
  private noiseSchedule: BaseNoiseSchedule;
  private timesteps: number[] = [];
  private sigmas: number[] = [];
  
  // Euler-specific state
  private stepIndex: number | null = null;
  private isScaleInputCalled: boolean = false;
  

  constructor(noiseScheduleType: NoiseScheduleType = 'karras') {
    super();
    this.noiseSchedule = this.createNoiseSchedule(noiseScheduleType);
  }

  get name(): string {
    return `EulerDiscrete (${this.noiseSchedule.name})`;
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
   * Reset scheduler state for new generation
   */
  reset(): void {
    this.stepIndex = null;
    this.isScaleInputCalled = false;
  }

  /**
   * Generate timesteps and sigmas
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
   * Scale model input according to Euler Discrete scheduler
   * Step 1 of the pseudocode
   */
  scaleModelInputs(sample: ort.Tensor, timestepIndex: number, sigma?: number): ort.Tensor {
    // 1.1 If step_index is None: set step_index = index_for_timestep(timestep)
    if (this.stepIndex === null) {
      this.stepIndex = timestepIndex;
    }
    
    // 1.2 sigma = sigmas[step_index]
    const currentSigma = sigma !== undefined ? sigma : this.sigmas[this.stepIndex];
    
    // 1.3 scaled_sample = sample / sqrt(sigma² + 1) - use float32 for precision
    const inputData = sample.data as Float32Array;
    const scaleFactor = 1.0 / Math.sqrt(currentSigma * currentSigma + 1.0);
    
    // Use float32 for calculation, then convert back to float16
    const outputData32 = new Float32Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      outputData32[i] = inputData[i] * scaleFactor;
    }

    
    // 1.4 is_scale_input_called = True
    this.isScaleInputCalled = true;
    
    // 1.5 Return scaled_sample
    return new ort.Tensor('float32', outputData32, sample.dims);
  }

  /**
   * Perform Euler Discrete scheduler step
   * Step 2 of the pseudocode
   */
  step(
    modelOutput: ort.Tensor,
    sample: ort.Tensor,
    timestepIndex: number,
    sigma?: number
  ): SchedulerStepResult {
    // 2.1 If not is_scale_input_called: warn user
    if (!this.isScaleInputCalled) {
      console.warn('EulerDiscreteScheduler: scale_model_input should be called before step');
    }
    
    // 2.2 If step_index is None: step_index = index_for_timestep(timestep)
    if (this.stepIndex === null) {
      this.stepIndex = timestepIndex;
    }
    
    // 2.3 Use float32 for internal calculations to avoid precision loss
    const sampleData = sample.data as Float32Array;
    const modelOutputData = modelOutput.data as Float32Array;
    
    // Convert to float32 for higher precision calculations
    const sampleData32 = new Float32Array(sampleData.length);
    const modelOutputData32 = new Float32Array(modelOutputData.length);
    const outputData32 = new Float32Array(modelOutputData.length);
    
    for (let i = 0; i < sampleData.length; i++) {
      sampleData32[i] = sampleData[i];
      modelOutputData32[i] = modelOutputData[i];
    }
    
    // 2.4 sigma = sigmas[step_index]
    const currentSigma = sigma !== undefined ? sigma : this.sigmas[this.stepIndex];
    
    // Get next sigma
    const nextSigma = this.stepIndex + 1 < this.sigmas.length ? this.sigmas[this.stepIndex + 1] : 0;
    
    // Process each element with float32 precision
    for (let i = 0; i < sampleData32.length; i++) {
      const currentSample = sampleData32[i];
      const eps = modelOutputData32[i];
      
      // Simple Euler step: x_{t-1} = x_t - (sigma_current - sigma_next) * epsilon
      const sigmaDt = currentSigma - nextSigma;
      outputData32[i] = currentSample - sigmaDt * eps;
    }
    
    // Convert back to float16 for tensor output
    const outputData = new Float32Array(outputData32.length);
    for (let i = 0; i < outputData32.length; i++) {
      outputData[i] = outputData32[i];
    }
    
    // 2.10 Increment step_index by 1
    if (this.stepIndex !== null) {
      this.stepIndex += 1;
    }
    
    // 2.11 Return prev_sample
    const prevSample = new ort.Tensor('float32', outputData, sample.dims);
    return { prevSample };
  }

  /**
   * Scale initial noise according to Euler Discrete scheduler
   */
  scaleInitialNoise(noise: ort.Tensor, timesteps: SchedulerTimesteps): ort.Tensor {
    // Euler typically scales by the initial sigma - use float32 for precision
    const initialSigma = timesteps.sigmas[0];
    const inputData = noise.data as Float32Array;
    
    // Use float32 for calculation, then convert back to float16
    const scaledData32 = new Float32Array(inputData.length);
    for (let i = 0; i < inputData.length; i++) {
      scaledData32[i] = inputData[i] * initialSigma;
    }
    
    const scaledData = new Float32Array(inputData.length);
    for (let i = 0; i < scaledData32.length; i++) {
      scaledData[i] = scaledData32[i];
    }
    
    return new ort.Tensor('float32', scaledData, noise.dims);
  }


  /**
   * Set noise schedule type
   */
  setNoiseSchedule(type: NoiseScheduleType): void {
    this.noiseSchedule = this.createNoiseSchedule(type);
  }
}
