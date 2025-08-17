# Noise Schedules

This directory contains different noise schedules that can be used with diffusion model schedulers.

## Overview

Noise schedules determine how sigma (noise) values are distributed across timesteps during the denoising process. Different schedules can significantly affect image quality and generation characteristics.

## Available Schedules

### Karras Schedule (`KarrasNoiseSchedule`)
- **Source**: "Elucidating the Design Space of Diffusion-Based Generative Models" by Tero Karras et al.
- **Formula**: `sigma = (sigmaMax^(1/rho) + t * (sigmaMin^(1/rho) - sigmaMax^(1/rho)))^rho`
- **Parameters**: `rho` (default: 7.0)
- **Characteristics**: Provides better distribution of noise levels, often resulting in higher quality images
- **Best for**: General purpose, high-quality image generation

### Linear Schedule (`LinearNoiseSchedule`)
- **Formula**: `sigma = sigmaMax - t * (sigmaMax - sigmaMin)`
- **Parameters**: None (beyond sigmaMin/sigmaMax)
- **Characteristics**: Simple linear interpolation between max and min sigma
- **Best for**: Fast generation, baseline comparisons

### Exponential Schedule (`ExponentialNoiseSchedule`)
- **Formula**: `sigma = sigmaMax * exp(-beta * t) + sigmaMin * (1 - exp(-beta * t))`
- **Parameters**: `beta` (default: 2.0)
- **Characteristics**: More aggressive noise reduction in early steps
- **Best for**: When you want faster initial denoising

## Usage

```typescript
import { createNoiseSchedule } from './noiseSchedules';

// Create a Karras schedule
const karras = createNoiseSchedule('karras', 0.0292, 14.6146, 1000, { rho: 7.0 });

// Create a linear schedule
const linear = createNoiseSchedule('linear', 0.0292, 14.6146, 1000);

// Create an exponential schedule
const exponential = createNoiseSchedule('exponential', 0.0292, 14.6146, 1000, { beta: 2.0 });

// Generate schedule for 20 steps
const schedule = karras.generateSchedule(20);
console.log(schedule.sigmas); // Array of sigma values
console.log(schedule.timesteps); // Corresponding timestep values
```

## Integration with Schedulers

Schedulers can now use any noise schedule:

```typescript
// Euler with different schedules
const eulerKarras = new EulerScheduler('karras');
const eulerLinear = new EulerScheduler('linear');
const eulerExponential = new EulerScheduler('exponential');

// DPM++ 2M SDE with different schedules
const dpmppKarras = new DPMpp2MSdeScheduler('karras');
const dpmppLinear = new DPMpp2MSdeScheduler('linear');
const dpmppExponential = new DPMpp2MSdeScheduler('exponential');
```

## Adding New Schedules

To add a new noise schedule:

1. Create a new class extending `BaseNoiseSchedule`
2. Implement the `generateSchedule(steps: number)` method
3. Add the schedule to the factory function in `index.ts`
4. Update the `NoiseScheduleType` union type

## Parameters

- **sigmaMin**: Minimum noise level (typically ~0.03)
- **sigmaMax**: Maximum noise level (typically ~15)
- **numTrainTimesteps**: Number of timesteps the model was trained on (typically 1000)
- **Schedule-specific parameters**: Each schedule may have additional parameters (rho for Karras, beta for Exponential, etc.)
