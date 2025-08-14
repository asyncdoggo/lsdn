import * as ort from 'onnxruntime-web/webgpu';

export interface SchedulerTimesteps {
  timesteps: number[];
  sigmas: number[];
}

export interface SchedulerStepResult {
  prevSample: ort.Tensor;
}

export abstract class BaseScheduler {
  protected numTrainTimesteps: number = 1000;
  protected numInferenceSteps: number = 4;
  
  /**
   * Generate timesteps and sigmas for the scheduler
   */
  abstract generateTimesteps(steps: number): SchedulerTimesteps;

  /**
   * Scale model inputs according to the scheduler's requirements
   */
  abstract scaleModelInputs(sample: ort.Tensor, timestepIndex: number, sigma?: number): ort.Tensor;

  /**
   * Perform a single scheduler step
   */
  abstract step(
    modelOutput: ort.Tensor,
    sample: ort.Tensor,
    timestepIndex: number,
    sigma?: number,
    sigmaNext?: number
  ): SchedulerStepResult;

  /**
   * Scale initial noise according to the scheduler
   */
  abstract scaleInitialNoise(noise: ort.Tensor, timesteps: SchedulerTimesteps): ort.Tensor;

  /**
   * Get the scheduler's name
   */
  abstract get name(): string;

  /**
   * Set the number of inference steps
   */
  setTimesteps(numInferenceSteps: number): void {
    this.numInferenceSteps = numInferenceSteps;
  }
}
