export class BlackHolePattern {
  /**
   * Generates black hole patterns with event horizon and accretion disk
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    const eventHorizon = Math.min(width, height) * 0.15;
    const accretionDisk = eventHorizon * 3;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        let intensity = 0;
        
        if (distance < eventHorizon) {
          // Event horizon - pure black
          intensity = 0;
        } else if (distance < accretionDisk) {
          // Accretion disk with gravitational lensing effect
          const diskPosition = (distance - eventHorizon) / (accretionDisk - eventHorizon);
          const spiralAngle = angle + distance * 0.02;
          const diskIntensity = Math.sin(spiralAngle * 8) * 0.3 + 0.7;
          
          // Gravitational lensing distortion
          const lensing = Math.exp(-distance / 30) * 0.5;
          intensity = diskIntensity * (1 - diskPosition) * (1 + lensing);
        } else {
          // Space background with gravitational lensing
          const lensing = Math.exp(-distance / 100) * 0.2;
          const backgroundNoise = Math.random() * 0.05;
          intensity = backgroundNoise + lensing;
        }
        
        intensity = Math.min(1, Math.max(0, intensity));
        const value = 255 * intensity;
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
