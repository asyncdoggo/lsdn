export class PaintSplashPattern {
  /**
   * Generates paint splash patterns with directional flow effects
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Fill with white background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 255;     // R
      data[i + 1] = 255; // G
      data[i + 2] = 255; // B
      data[i + 3] = 255; // A
    }
    
    // Create splash centers with randomization
    const splashes = [];
    const numSplashes = 2 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numSplashes; i++) {
      splashes.push({
        x: Math.random() * width,
        y: Math.random() * height,
        velocity: {
          x: (Math.random() - 0.5) * 200,
          y: (Math.random() - 0.5) * 200
        },
        size: 60 + Math.random() * 120,
        randomSeed: Math.random() * 1000
      });
    }
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        let value = 255;
        
        for (const splash of splashes) {
          const dx = x - splash.x;
          const dy = y - splash.y;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          // Create splash patterns with sharp edges
          const angle = Math.atan2(dy, dx);
          const velocityAngle = Math.atan2(splash.velocity.y, splash.velocity.x);
          const angleDiff = Math.abs(angle - velocityAngle);
          
          const flowFactor = Math.cos(angleDiff) * 0.7 + 0.3;
          const effectiveDistance = distance / flowFactor;
          
          if (effectiveDistance < splash.size) {
            const intensity = 1 - (effectiveDistance / splash.size);
            // Sharp threshold for crisp edges
            if (intensity > 0.4) {
              value = 0; // Pure black
            }
          }
        }
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
