export class GalaxyPattern {
  /**
   * Generates sophisticated spiral galaxy patterns with multiple components
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Galaxy parameters
    const galaxyType = Math.floor(Math.random() * 4);
    const centerX = width / 2 + (Math.random() - 0.5) * width * 0.3;
    const centerY = height / 2 + (Math.random() - 0.5) * height * 0.3;
    const maxRadius = Math.min(width, height) * (0.4 + Math.random() * 0.3);
    
    // Initialize to space background
    for (let i = 0; i < data.length; i += 4) {
      data[i] = 0;     // R
      data[i + 1] = 0; // G
      data[i + 2] = 5; // B - slight blue for space
      data[i + 3] = 255; // A
    }
    
    switch (galaxyType) {
      case 0:
        this.generateSpiralGalaxy(data, width, height, centerX, centerY, maxRadius);
        break;
      case 1:
        this.generateBarredSpiralGalaxy(data, width, height, centerX, centerY, maxRadius);
        break;
      case 2:
        this.generateEllipticalGalaxy(data, width, height, centerX, centerY, maxRadius);
        break;
      case 3:
        this.generateIrregularGalaxy(data, width, height, centerX, centerY, maxRadius);
        break;
    }
    
    // Add cosmic dust and background stars
    this.addCosmicDust(data, width, height);
    this.addBackgroundStars(data, width, height);
  }

  /**
   * Classic spiral galaxy with logarithmic arms
   */
  private static generateSpiralGalaxy(data: Uint8ClampedArray, width: number, height: number, centerX: number, centerY: number, maxRadius: number): void {
    const numArms = 2 + Math.floor(Math.random() * 3); // 2-4 arms
    const pitchAngle = Math.PI / (8 + Math.random() * 8); // Spiral pitch
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        if (distance > maxRadius) continue;
        
        // Core bulge (yellow-orange)
        const coreRadius = maxRadius * 0.15;
        if (distance < coreRadius) {
          const coreIntensity = Math.exp(-Math.pow(distance / (coreRadius * 0.6), 2));
          data[index] = Math.min(255, data[index] + coreIntensity * 255);
          data[index + 1] = Math.min(255, data[index + 1] + coreIntensity * 200);
          data[index + 2] = Math.min(255, data[index + 2] + coreIntensity * 100);
        }
        
        // Spiral arms
        let armIntensity = 0;
        for (let arm = 0; arm < numArms; arm++) {
          const armAngle = (arm * 2 * Math.PI) / numArms;
          
          // Logarithmic spiral: r = a * e^(b * θ)
          const expectedAngle = armAngle - Math.log(distance / (maxRadius * 0.1)) / Math.tan(pitchAngle);
          let angleDiff = Math.abs(angle - expectedAngle);
          
          // Handle angle wrapping
          angleDiff = Math.min(angleDiff, 2 * Math.PI - angleDiff);
          
          const armWidth = maxRadius * 0.05;
          if (angleDiff < armWidth) {
            const armStrength = Math.exp(-Math.pow(angleDiff / (armWidth * 0.5), 2));
            const distanceFalloff = Math.exp(-distance / (maxRadius * 0.7));
            
            // Add noise for realistic arm structure
            const noise = this.noise2D(x * 0.01, y * 0.01) * 0.5 + 0.5;
            armIntensity += armStrength * distanceFalloff * noise;
          }
        }
        
        if (armIntensity > 0.1) {
          // Blue-white for young star regions
          data[index] = Math.min(255, data[index] + armIntensity * 180);
          data[index + 1] = Math.min(255, data[index + 1] + armIntensity * 200);
          data[index + 2] = Math.min(255, data[index + 2] + armIntensity * 255);
        }
        
        // Disk component (reddish for older stars)
        const diskRadius = maxRadius * 0.8;
        if (distance < diskRadius) {
          const diskIntensity = Math.exp(-Math.pow(distance / (diskRadius * 0.6), 1.5)) * 0.3;
          data[index] = Math.min(255, data[index] + diskIntensity * 120);
          data[index + 1] = Math.min(255, data[index + 1] + diskIntensity * 80);
          data[index + 2] = Math.min(255, data[index + 2] + diskIntensity * 40);
        }
      }
    }
  }

  /**
   * Barred spiral galaxy with central bar structure
   */
  private static generateBarredSpiralGalaxy(data: Uint8ClampedArray, width: number, height: number, centerX: number, centerY: number, maxRadius: number): void {
    const barLength = maxRadius * (0.3 + Math.random() * 0.3);
    const barWidth = barLength * 0.3;
    const barAngle = Math.random() * Math.PI;
    
    // First generate the bar
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const dx = x - centerX;
        const dy = y - centerY;
        
        // Rotate coordinates to align with bar
        const rotatedX = dx * Math.cos(-barAngle) - dy * Math.sin(-barAngle);
        const rotatedY = dx * Math.sin(-barAngle) + dy * Math.cos(-barAngle);
        
        if (Math.abs(rotatedX) < barLength && Math.abs(rotatedY) < barWidth) {
          const barIntensity = Math.exp(-Math.pow(rotatedY / (barWidth * 0.5), 2)) * 
                              Math.exp(-Math.pow(Math.abs(rotatedX) / (barLength * 0.7), 1.5));
          
          data[index] = Math.min(255, data[index] + barIntensity * 200);
          data[index + 1] = Math.min(255, data[index + 1] + barIntensity * 150);
          data[index + 2] = Math.min(255, data[index + 2] + barIntensity * 80);
        }
      }
    }
    
    // Then add spiral arms emanating from bar ends
    this.generateSpiralGalaxy(data, width, height, centerX, centerY, maxRadius);
  }

  /**
   * Elliptical galaxy with smooth brightness profile
   */
  private static generateEllipticalGalaxy(data: Uint8ClampedArray, width: number, height: number, centerX: number, centerY: number, maxRadius: number): void {
    const ellipticity = 0.1 + Math.random() * 0.7; // 0 = circular, 1 = very elliptical
    const majorAxis = maxRadius;
    const minorAxis = maxRadius * (1 - ellipticity);
    const rotationAngle = Math.random() * Math.PI;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const dx = x - centerX;
        const dy = y - centerY;
        
        // Rotate coordinates
        const rotatedX = dx * Math.cos(-rotationAngle) - dy * Math.sin(-rotationAngle);
        const rotatedY = dx * Math.sin(-rotationAngle) + dy * Math.cos(-rotationAngle);
        
        // Elliptical distance
        const ellipticalDistance = Math.sqrt(
          Math.pow(rotatedX / majorAxis, 2) + Math.pow(rotatedY / minorAxis, 2)
        );
        
        if (ellipticalDistance < 1) {
          // Sersic profile approximation
          const sersicIndex = 2 + Math.random() * 2; // n = 2-4
          const intensity = Math.exp(-Math.pow(ellipticalDistance, 1/sersicIndex) * 5);
          
          // Elliptical galaxies are typically redder (older stars)
          data[index] = Math.min(255, data[index] + intensity * 200);
          data[index + 1] = Math.min(255, data[index + 1] + intensity * 120);
          data[index + 2] = Math.min(255, data[index + 2] + intensity * 80);
        }
      }
    }
  }

  /**
   * Irregular galaxy with chaotic structure
   */
  private static generateIrregularGalaxy(data: Uint8ClampedArray, width: number, height: number, centerX: number, centerY: number, maxRadius: number): void {
    const numClusters = 8 + Math.floor(Math.random() * 12);
    
    for (let cluster = 0; cluster < numClusters; cluster++) {
      const clusterX = centerX + (Math.random() - 0.5) * maxRadius * 1.5;
      const clusterY = centerY + (Math.random() - 0.5) * maxRadius * 1.5;
      const clusterRadius = maxRadius * (0.1 + Math.random() * 0.3);
      const clusterIntensity = 0.3 + Math.random() * 0.7;
      
      for (let y = 0; y < height; y++) {
        for (let x = 0; x < width; x++) {
          const index = (y * width + x) * 4;
          
          const dx = x - clusterX;
          const dy = y - clusterY;
          const distance = Math.sqrt(dx * dx + dy * dy);
          
          if (distance < clusterRadius) {
            const noise = this.noise2D(x * 0.02, y * 0.02) * 0.5 + 0.5;
            const intensity = Math.exp(-Math.pow(distance / (clusterRadius * 0.6), 2)) * 
                            clusterIntensity * noise;
            
            // Random color for star formation regions
            const colorVariation = Math.random();
            if (colorVariation < 0.3) {
              // Red nebulae
              data[index] = Math.min(255, data[index] + intensity * 255);
              data[index + 1] = Math.min(255, data[index + 1] + intensity * 100);
              data[index + 2] = Math.min(255, data[index + 2] + intensity * 100);
            } else if (colorVariation < 0.6) {
              // Blue star clusters
              data[index] = Math.min(255, data[index] + intensity * 150);
              data[index + 1] = Math.min(255, data[index + 1] + intensity * 200);
              data[index + 2] = Math.min(255, data[index + 2] + intensity * 255);
            } else {
              // White/yellow mixed populations
              data[index] = Math.min(255, data[index] + intensity * 200);
              data[index + 1] = Math.min(255, data[index + 1] + intensity * 180);
              data[index + 2] = Math.min(255, data[index + 2] + intensity * 120);
            }
          }
        }
      }
    }
  }

  /**
   * Add cosmic dust lanes and dark nebulae
   */
  private static addCosmicDust(data: Uint8ClampedArray, width: number, height: number): void {
    const numDustLanes = 3 + Math.floor(Math.random() * 5);
    
    for (let lane = 0; lane < numDustLanes; lane++) {
      const startX = Math.random() * width;
      const startY = Math.random() * height;
      const angle = Math.random() * Math.PI * 2;
      const length = 100 + Math.random() * 200;
      const width_dust = 10 + Math.random() * 20;
      
      for (let t = 0; t < length; t += 2) {
        const x = Math.floor(startX + Math.cos(angle) * t);
        const y = Math.floor(startY + Math.sin(angle) * t);
        
        for (let w = -width_dust; w < width_dust; w++) {
          const dustX = x + Math.floor(Math.cos(angle + Math.PI/2) * w);
          const dustY = y + Math.floor(Math.sin(angle + Math.PI/2) * w);
          
          if (dustX >= 0 && dustX < width && dustY >= 0 && dustY < height) {
            const index = (dustY * width + dustX) * 4;
            const opacity = Math.exp(-Math.pow(w / (width_dust * 0.5), 2)) * 0.7;
            
            data[index] = Math.floor(data[index] * (1 - opacity));
            data[index + 1] = Math.floor(data[index + 1] * (1 - opacity));
            data[index + 2] = Math.floor(data[index + 2] * (1 - opacity));
          }
        }
      }
    }
  }

  /**
   * Add background stars
   */
  private static addBackgroundStars(data: Uint8ClampedArray, width: number, height: number): void {
    const numStars = 100 + Math.floor(Math.random() * 200);
    
    for (let star = 0; star < numStars; star++) {
      const x = Math.floor(Math.random() * width);
      const y = Math.floor(Math.random() * height);
      const brightness = 50 + Math.random() * 205;
      const size = Math.random() < 0.9 ? 1 : 2;
      
      for (let sy = -size; sy <= size; sy++) {
        for (let sx = -size; sx <= size; sx++) {
          const starX = x + sx;
          const starY = y + sy;
          
          if (starX >= 0 && starX < width && starY >= 0 && starY < height) {
            const index = (starY * width + starX) * 4;
            const distance = Math.sqrt(sx * sx + sy * sy);
            const intensity = brightness * Math.exp(-distance);
            
            data[index] = Math.min(255, data[index] + intensity);
            data[index + 1] = Math.min(255, data[index + 1] + intensity);
            data[index + 2] = Math.min(255, data[index + 2] + intensity);
          }
        }
      }
    }
  }

  /**
   * Simple 2D noise function
   */
  private static noise2D(x: number, y: number): number {
    const n = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453;
    return n - Math.floor(n);
  }
}
