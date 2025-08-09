import type { Resolution } from '../../imageGenerator';

export class NeuralPattern {
  /**
   * Generates neural network-like patterns with nodes and connections
   */
  static generate(data: Uint8ClampedArray, resolution: Resolution): void {
    // Fill with dark background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 20;      // R
      data[i + 1] = 20;  // G
      data[i + 2] = 40;  // B
      data[i + 3] = 255; // A
    }
    
    // Generate neural nodes
    const nodeCount = 20 + Math.floor(Math.random() * 30);
    const nodes: Array<{ x: number, y: number, size: number, activity: number }> = [];
    
    // Create nodes
    for (let i = 0; i < nodeCount; i++) {
      nodes.push({
        x: Math.random() * resolution.width,
        y: Math.random() * resolution.height,
        size: 5 + Math.random() * 15,
        activity: Math.random()
      });
    }
    
    // Draw connections between nearby nodes
    const maxConnectionDistance = Math.min(resolution.width, resolution.height) * 0.2;
    
    for (let i = 0; i < nodes.length; i++) {
      for (let j = i + 1; j < nodes.length; j++) {
        const node1 = nodes[i];
        const node2 = nodes[j];
        
        const distance = Math.sqrt(
          (node1.x - node2.x) ** 2 + (node1.y - node2.y) ** 2
        );
        
        if (distance < maxConnectionDistance && Math.random() > 0.7) {
          // Draw connection with activity-based intensity
          const connectionStrength = (node1.activity + node2.activity) / 2;
          this.drawConnection(data, resolution, node1, node2, connectionStrength);
        }
      }
    }
    
    // Draw nodes on top of connections
    for (const node of nodes) {
      this.drawNeuralNode(data, resolution, node);
    }
    
    // Add some neural impulses (moving dots along connections)
    const impulseCount = 5 + Math.floor(Math.random() * 10);
    
    for (let i = 0; i < impulseCount; i++) {
      const x = Math.random() * resolution.width;
      const y = Math.random() * resolution.height;
      const intensity = 0.5 + Math.random() * 0.5;
      
      this.drawImpulse(data, resolution, x, y, intensity);
    }
  }

  private static drawNeuralNode(data: Uint8ClampedArray, resolution: Resolution, node: { x: number, y: number, size: number, activity: number }): void {
    const centerX = Math.round(node.x);
    const centerY = Math.round(node.y);
    const radius = node.size;
    
    for (let y = -radius; y <= radius; y++) {
      for (let x = -radius; x <= radius; x++) {
        const distance = Math.sqrt(x * x + y * y);
        
        if (distance <= radius) {
          const nodeX = centerX + x;
          const nodeY = centerY + y;
          
          if (nodeX >= 0 && nodeX < resolution.width && nodeY >= 0 && nodeY < resolution.height) {
            const index = (nodeY * resolution.width + nodeX) * 4;
            
            // Node color based on activity level
            const intensity = node.activity * (1 - distance / radius);
            
            if (distance > radius - 2) {
              // Node border
              data[index] = Math.min(255, 100 + intensity * 100);     // R
              data[index + 1] = Math.min(255, 150 + intensity * 100); // G
              data[index + 2] = Math.min(255, 200 + intensity * 55);  // B
            } else {
              // Node core
              data[index] = Math.min(255, 60 + intensity * 150);      // R
              data[index + 1] = Math.min(255, 100 + intensity * 150); // G
              data[index + 2] = Math.min(255, 180 + intensity * 75);  // B
            }
          }
        }
      }
    }
  }

  private static drawConnection(data: Uint8ClampedArray, resolution: Resolution, node1: { x: number, y: number, activity: number }, node2: { x: number, y: number, activity: number }, strength: number): void {
    const steps = Math.max(Math.abs(node2.x - node1.x), Math.abs(node2.y - node1.y));
    
    for (let i = 0; i <= steps; i++) {
      const t = i / steps;
      const x = Math.round(node1.x + (node2.x - node1.x) * t);
      const y = Math.round(node1.y + (node2.y - node1.y) * t);
      
      if (x >= 0 && x < resolution.width && y >= 0 && y < resolution.height) {
        const index = (y * resolution.width + x) * 4;
        
        // Connection intensity varies along the line
        const lineIntensity = strength * (0.3 + 0.7 * Math.sin(t * Math.PI));
        
        data[index] = Math.min(255, data[index] + lineIntensity * 80);      // R
        data[index + 1] = Math.min(255, data[index + 1] + lineIntensity * 120); // G
        data[index + 2] = Math.min(255, data[index + 2] + lineIntensity * 160); // B
      }
    }
  }

  private static drawImpulse(data: Uint8ClampedArray, resolution: Resolution, x: number, y: number, intensity: number): void {
    const centerX = Math.round(x);
    const centerY = Math.round(y);
    const radius = 3 + intensity * 4;
    
    for (let py = -radius; py <= radius; py++) {
      for (let px = -radius; px <= radius; px++) {
        const distance = Math.sqrt(px * px + py * py);
        
        if (distance <= radius) {
          const impulseX = centerX + px;
          const impulseY = centerY + py;
          
          if (impulseX >= 0 && impulseX < resolution.width && impulseY >= 0 && impulseY < resolution.height) {
            const index = (impulseY * resolution.width + impulseX) * 4;
            
            const falloff = 1 - distance / radius;
            const impulseIntensity = intensity * falloff;
            
            // Bright white/blue impulse
            data[index] = Math.min(255, data[index] + impulseIntensity * 200);     // R
            data[index + 1] = Math.min(255, data[index + 1] + impulseIntensity * 220); // G
            data[index + 2] = Math.min(255, data[index + 2] + impulseIntensity * 255); // B
          }
        }
      }
    }
  }
}
