import { BaseScheduler } from './baseScheduler';
import { EulerScheduler } from './eulerScheduler';
import { DDPMScheduler } from './ddpmScheduler';
import { LMSScheduler } from './lmsScheduler';
import { HeunScheduler } from './heunScheduler';
import { DPMpp2MSdeScheduler } from './dpmpp2mSdeScheduler';

export type SchedulerType = 
  | 'euler-karras' 
  | 'euler-linear'
  | 'euler-exponential'
  | 'ddpm' 
  | 'lms' 
  | 'heun' 
  | 'dpmpp-2m-sde-karras'
  | 'dpmpp-2m-sde-linear'
  | 'dpmpp-2m-sde-exponential';

export class SchedulerRegistry {
  private static schedulers: Map<SchedulerType, () => BaseScheduler> = new Map([
    // New Euler schedulers with different noise schedules
    ['euler-linear', () => new EulerScheduler('linear') as BaseScheduler],
    ['euler-exponential', () => new EulerScheduler('exponential') as BaseScheduler],
    ['euler-karras', () => new EulerScheduler('karras') as BaseScheduler],
    // DPM++ 2M SDE with different noise schedules
    ['dpmpp-2m-sde-karras', () => new DPMpp2MSdeScheduler('karras') as BaseScheduler],
    ['dpmpp-2m-sde-linear', () => new DPMpp2MSdeScheduler('linear') as BaseScheduler],
    ['dpmpp-2m-sde-exponential', () => new DPMpp2MSdeScheduler('exponential') as BaseScheduler],
    
    // Other schedulers
    ['ddpm', () => new DDPMScheduler() as BaseScheduler],
    ['lms', () => new LMSScheduler() as BaseScheduler],
    ['heun', () => new HeunScheduler() as BaseScheduler],
    // Add more schedulers here as they're implemented
  ]);

  /**
   * Create a scheduler instance by type
   */
  static createScheduler(type: SchedulerType): BaseScheduler {
    const schedulerFactory = this.schedulers.get(type);
    if (!schedulerFactory) {
      throw new Error(`Unknown scheduler type: ${type}`);
    }
    return schedulerFactory();
  }

  /**
   * Get all available scheduler types
   */
  static getAvailableSchedulers(): SchedulerType[] {
    return Array.from(this.schedulers.keys());
  }

  /**
   * Register a new scheduler type
   */
  static registerScheduler(type: SchedulerType, factory: () => BaseScheduler): void {
    this.schedulers.set(type, factory);
  }

  /**
   * Check if a scheduler type is available
   */
  static hasScheduler(type: SchedulerType): boolean {
    return this.schedulers.has(type);
  }
}
