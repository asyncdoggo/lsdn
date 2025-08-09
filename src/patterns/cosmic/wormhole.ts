export class WormholePattern {
  /**
   * Generates wormhole patterns with randomized tunnel effects
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    
    // Randomized parameters for unique wormholes
    const centerOffsetX = (Math.random() - 0.5) * 0.2 * width;
    const centerOffsetY = (Math.random() - 0.5) * 0.2 * height;
    const centerX = width / 2 + centerOffsetX;
    const centerY = height / 2 + centerOffsetY;
    
    const spiralArms = 6 + Math.floor(Math.random() * 8); // 6-13 spiral arms
    const tunnelSize = 150 + Math.random() * 150; // Variable tunnel size
    const distortionStrength = 10 + Math.random() * 30; // Variable distortion
    const spiralTightness = 0.02 + Math.random() * 0.08; // Variable spiral tightness
    const depthFactor = 200 + Math.random() * 200; // Variable depth perception
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create randomized wormhole tunnel effect
        const tunnelDepth = Math.max(0, 1 - distance / tunnelSize);
        const spiralPattern = Math.sin(angle * spiralArms + distance * spiralTightness) * 0.3 + 0.7;
        
        // Add randomized space-time distortion
        const distortion = Math.sin(distance * 0.02 + angle * 4) * distortionStrength;
        const effectiveDistance = distance + distortion;
        
        const tunnelIntensity = tunnelDepth * spiralPattern * (1 - effectiveDistance / depthFactor);
        
        // Sharp thresholding for defined edges
        const value = tunnelIntensity > 0.4 ? 0 : 255;
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
