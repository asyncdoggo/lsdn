import { BaseScheduler } from './baseScheduler';
import { EulerKarrasScheduler } from './eulerKarrasScheduler';
import { DDPMScheduler } from './ddpmScheduler';
import { LMSScheduler } from './lmsScheduler';
import { HeunScheduler } from './heunScheduler';

export type SchedulerType = 'euler-karras' | 'ddpm' | 'lms' | 'heun';

export class SchedulerRegistry {
  private static schedulers: Map<SchedulerType, () => BaseScheduler> = new Map([
    ['euler-karras', () => new EulerKarrasScheduler() as BaseScheduler],
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
