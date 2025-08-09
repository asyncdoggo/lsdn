import type { Resolution } from '../../imageGenerator';

export class LightningPattern {
  /**
   * Generates sophisticated lightning patterns using multiple algorithms
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    const patternType = Math.floor(Math.random() * 5);
    
    switch (patternType) {
      case 0:
        this.generateFractalLightning(data, resolution);
        break;
      case 1:
        this.generateDLALightning(data, resolution);
        break;
      case 2:
        this.generateElectricField(data, resolution);
        break;
      case 3:
        this.generateTreeLightning(data, resolution);
        break;
      case 4:
        this.generatePlasmaArcs(data, resolution);
        break;
    }
  }

  /**
   * Fractal lightning using L-systems
   */
  private static generateFractalLightning(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    const numBolts = 2 + Math.floor(Math.random() * 3);
    
    for (let bolt = 0; bolt < numBolts; bolt++) {
      // Start position
      const startX = Math.random() * resolution.width;
      const startY = Math.random() * 0.2 * resolution.height;
      
      // Generate fractal branches
      this.drawFractalBranch(
        data, resolution,
        startX, startY,
        Math.PI / 2, // Initial angle (downward)
        Math.min(resolution.width, resolution.height) / 4,
        6, // Recursion depth
        0.7, // Length ratio
        Math.PI / 6 // Angle variation
      );
    }
  }

  /**
   * Draws a fractal branch recursively
   */
  private static drawFractalBranch(
    data: Uint8ClampedArray, 
    resolution: Resolution,
    x: number, 
    y: number, 
    angle: number, 
    length: number, 
    depth: number,
    ratio: number,
    angleVar: number
  ): void {
    if (depth <= 0 || length < 5) return;
    
    // Draw the main branch
    const endX = x + Math.cos(angle) * length;
    const endY = y + Math.sin(angle) * length;
    
    this.drawLightningLine(data, resolution, x, y, endX, endY, 2);
    
    // Add branching
    if (Math.random() < 0.7) {
      // Left branch
      const leftAngle = angle - angleVar * (0.5 + Math.random() * 0.5);
      const leftLength = length * ratio * (0.6 + Math.random() * 0.4);
      this.drawFractalBranch(data, resolution, endX, endY, leftAngle, leftLength, depth - 1, ratio, angleVar);
    }
    
    if (Math.random() < 0.7) {
      // Right branch
      const rightAngle = angle + angleVar * (0.5 + Math.random() * 0.5);
      const rightLength = length * ratio * (0.6 + Math.random() * 0.4);
      this.drawFractalBranch(data, resolution, endX, endY, rightAngle, rightLength, depth - 1, ratio, angleVar);
    }
    
    // Continue main branch
    if (Math.random() < 0.8) {
      const mainAngle = angle + (Math.random() - 0.5) * angleVar * 0.5;
      const mainLength = length * ratio * (0.8 + Math.random() * 0.2);
      this.drawFractalBranch(data, resolution, endX, endY, mainAngle, mainLength, depth - 1, ratio, angleVar);
    }
  }

  /**
   * Diffusion Limited Aggregation lightning
   */
  private static generateDLALightning(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    // Seed points (sources of lightning)
    const seeds: { x: number; y: number }[] = [];
    const numSeeds = 2 + Math.floor(Math.random() * 4);
    
    for (let i = 0; i < numSeeds; i++) {
      const x = Math.random() * resolution.width;
      const y = Math.random() * resolution.height * 0.3;
      seeds.push({ x, y });
      
      // Mark seed
      const index = (Math.floor(y) * resolution.width + Math.floor(x)) * 4;
      if (index >= 0 && index < data.length) {
        data[index] = 255;
        data[index + 1] = 255;
        data[index + 2] = 255;
      }
    }

    // Grown structure
    const grown = new Set<string>();
    seeds.forEach(seed => grown.add(`${Math.floor(seed.x)},${Math.floor(seed.y)}`));

    // DLA growth
    const maxParticles = 2000;
    
    for (let particle = 0; particle < maxParticles; particle++) {
      // Random starting position
      let x = Math.random() * resolution.width;
      let y = Math.random() * resolution.height;
      
      // Random walk until touching grown structure
      let stuck = false;
      let steps = 0;
      const maxSteps = 1000;
      
      while (!stuck && steps < maxSteps) {
        // Move randomly
        x += (Math.random() - 0.5) * 6;
        y += (Math.random() - 0.5) * 6;
        
        // Keep in bounds
        x = Math.max(0, Math.min(resolution.width - 1, x));
        y = Math.max(0, Math.min(resolution.height - 1, y));
        
        // Check if touching grown structure
        const px = Math.floor(x);
        const py = Math.floor(y);
        
        for (let dy = -1; dy <= 1; dy++) {
          for (let dx = -1; dx <= 1; dx++) {
            const nx = px + dx;
            const ny = py + dy;
            if (grown.has(`${nx},${ny}`)) {
              stuck = true;
              break;
            }
          }
          if (stuck) break;
        }
        
        steps++;
      }
      
      if (stuck) {
        // Add to grown structure
        const px = Math.floor(x);
        const py = Math.floor(y);
        grown.add(`${px},${py}`);
        
        // Draw the particle
        const index = (py * resolution.width + px) * 4;
        if (index >= 0 && index < data.length) {
          data[index] = 255;
          data[index + 1] = 255;
          data[index + 2] = 255;
        }
      }
    }
  }

  /**
   * Electric field visualization
   */
  private static generateElectricField(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    // Electric charges
    const charges: { x: number; y: number; strength: number }[] = [];
    const numCharges = 3 + Math.floor(Math.random() * 5);
    
    for (let i = 0; i < numCharges; i++) {
      charges.push({
        x: Math.random() * resolution.width,
        y: Math.random() * resolution.height,
        strength: (Math.random() - 0.5) * 2 // Positive or negative
      });
    }

    // Draw field lines
    const numLines = 100;
    
    for (let line = 0; line < numLines; line++) {
      let x = Math.random() * resolution.width;
      let y = Math.random() * resolution.height;
      
      const path: { x: number; y: number }[] = [];
      
      // Trace field line
      for (let step = 0; step < 200; step++) {
        path.push({ x, y });
        
        // Calculate electric field at current position
        let fieldX = 0;
        let fieldY = 0;
        
        for (const charge of charges) {
          const dx = x - charge.x;
          const dy = y - charge.y;
          const distanceSq = dx * dx + dy * dy + 1; // Add 1 to avoid division by zero
          const distance = Math.sqrt(distanceSq);
          
          fieldX += charge.strength * dx / (distanceSq * distance);
          fieldY += charge.strength * dy / (distanceSq * distance);
        }
        
        // Normalize field
        const fieldMagnitude = Math.sqrt(fieldX * fieldX + fieldY * fieldY);
        if (fieldMagnitude > 0) {
          fieldX /= fieldMagnitude;
          fieldY /= fieldMagnitude;
        }
        
        // Move along field line
        x += fieldX * 3;
        y += fieldY * 3;
        
        // Check bounds
        if (x < 0 || x >= resolution.width || y < 0 || y >= resolution.height) break;
      }
      
      // Draw the path if it's long enough
      if (path.length > 10) {
        for (let i = 0; i < path.length - 1; i++) {
          this.drawLightningLine(data, resolution, path[i].x, path[i].y, path[i + 1].x, path[i + 1].y, 1);
        }
      }
    }
  }

  /**
   * Tree-like lightning structure
   */
  private static generateTreeLightning(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    // Start from top
    const startX = resolution.width / 2 + (Math.random() - 0.5) * resolution.width * 0.3;
    const startY = 0;
    
    this.growLightningTree(data, resolution, startX, startY, Math.PI / 2, 0, 50);
  }

  /**
   * Grows a tree-like lightning structure
   */
  private static growLightningTree(
    data: Uint8ClampedArray,
    resolution: Resolution,
    x: number,
    y: number,
    angle: number,
    generation: number,
    energy: number
  ): void {
    if (generation > 8 || energy < 5 || y >= resolution.height) return;
    
    // Segment length based on energy
    const segmentLength = 10 + energy * 0.5;
    const endX = x + Math.cos(angle) * segmentLength;
    const endY = y + Math.sin(angle) * segmentLength;
    
    // Draw segment
    this.drawLightningLine(data, resolution, x, y, endX, endY, Math.max(1, Math.floor(energy / 20)));
    
    // Branch probability decreases with generation
    const branchProbability = Math.max(0.1, 0.8 - generation * 0.1);
    
    if (Math.random() < branchProbability) {
      // Main branch continues
      const mainAngle = angle + (Math.random() - 0.5) * 0.3;
      this.growLightningTree(data, resolution, endX, endY, mainAngle, generation + 1, energy * 0.8);
      
      // Side branches
      if (Math.random() < 0.6) {
        const leftAngle = angle - 0.5 - Math.random() * 0.5;
        this.growLightningTree(data, resolution, endX, endY, leftAngle, generation + 1, energy * 0.6);
      }
      
      if (Math.random() < 0.6) {
        const rightAngle = angle + 0.5 + Math.random() * 0.5;
        this.growLightningTree(data, resolution, endX, endY, rightAngle, generation + 1, energy * 0.6);
      }
    }
  }

  /**
   * Plasma arc effects
   */
  private static generatePlasmaArcs(data: Uint8ClampedArray, resolution: Resolution): void {
    // Clear canvas
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;
      data[i + 1] = 0;
      data[i + 2] = 0;
      data[i + 3] = 255;
    }

    const numArcs = 5 + Math.floor(Math.random() * 8);
    
    for (let arc = 0; arc < numArcs; arc++) {
      // Random start and end points
      const startX = Math.random() * resolution.width;
      const startY = Math.random() * resolution.height;
      const endX = Math.random() * resolution.width;
      const endY = Math.random() * resolution.height;
      
      // Generate curved plasma arc
      const steps = Math.floor(Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2) / 5);
      
      for (let step = 0; step < steps; step++) {
        const t = step / steps;
        
        // Bezier curve for smooth arc
        const midX = (startX + endX) / 2 + (Math.random() - 0.5) * 100;
        const midY = (startY + endY) / 2 + (Math.random() - 0.5) * 100;
        
        const x = (1 - t) * (1 - t) * startX + 2 * (1 - t) * t * midX + t * t * endX;
        const y = (1 - t) * (1 - t) * startY + 2 * (1 - t) * t * midY + t * t * endY;
        
        // Add plasma turbulence
        const turbX = x + Math.sin(step * 0.5) * 5 * Math.random();
        const turbY = y + Math.cos(step * 0.7) * 5 * Math.random();
        
        // Draw point with varying thickness
        const thickness = 2 + Math.sin(t * Math.PI) * 3;
        this.drawLightningPoint(data, resolution, turbX, turbY, thickness);
      }
    }
  }

  /**
   * Draws a lightning line with jagged edges
   */
  private static drawLightningLine(
    data: Uint8ClampedArray,
    resolution: Resolution,
    x1: number,
    y1: number,
    x2: number,
    y2: number,
    thickness: number
  ): void {
    const distance = Math.sqrt((x2 - x1) ** 2 + (y2 - y1) ** 2);
    const steps = Math.ceil(distance / 2);
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = x1 + (x2 - x1) * t + (Math.random() - 0.5) * thickness;
      const y = y1 + (y2 - y1) * t + (Math.random() - 0.5) * thickness;
      
      this.drawLightningPoint(data, resolution, x, y, thickness);
    }
  }

  /**
   * Draws a point with given thickness
   */
  private static drawLightningPoint(
    data: Uint8ClampedArray,
    resolution: Resolution,
    x: number,
    y: number,
    thickness: number
  ): void {
    const px = Math.floor(x);
    const py = Math.floor(y);
    const radius = Math.ceil(thickness / 2);
    
    for (let dy = -radius; dy <= radius; dy++) {
      for (let dx = -radius; dx <= radius; dx++) {
        const nx = px + dx;
        const ny = py + dy;
        
        if (nx >= 0 && nx < resolution.width && ny >= 0 && ny < resolution.height) {
          const distance = Math.sqrt(dx * dx + dy * dy);
          if (distance <= radius) {
            const index = (ny * resolution.width + nx) * 4;
            const intensity = Math.max(0, 255 * (1 - distance / radius));
            
            data[index] = Math.max(data[index], intensity);
            data[index + 1] = Math.max(data[index + 1], intensity);
            data[index + 2] = Math.max(data[index + 2], intensity);
          }
        }
      }
    }
  }
}
