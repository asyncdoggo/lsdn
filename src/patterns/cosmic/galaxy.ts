export class GalaxyPattern {
  /**
   * Generates spiral galaxy patterns with arms and center
   */
  static generate(imageData: ImageData, width: number, height: number): void {
    const data = imageData.data;
    const centerX = width / 2;
    const centerY = height / 2;
    
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const index = (y * width + x) * 4;
        
        const dx = x - centerX;
        const dy = y - centerY;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const angle = Math.atan2(dy, dx);
        
        // Create spiral galaxy arms
        const spiralArms = 3;
        const spiralTightness = 0.01;
        const spiralAngle = angle + distance * spiralTightness;
        
        let armIntensity = 0;
        for (let arm = 0; arm < spiralArms; arm++) {
          const armAngle = (arm * Math.PI * 2) / spiralArms;
          const angleDiff = Math.abs(Math.sin((spiralAngle - armAngle) * spiralArms / 2));
          
          if (angleDiff < 0.8) {
            const armStrength = Math.exp(-distance / 200) * (1 - angleDiff);
            armIntensity += armStrength;
          }
        }
        
        // Add galactic center
        const centerGlow = Math.exp(-distance / 50) * 0.8;
        
        // Add cosmic dust and stars
        const starNoise = Math.random() < 0.001 ? 1 : 0;
        const dustNoise = (Math.sin(x * 0.1) * Math.cos(y * 0.08) + 1) * 0.1;
        
        const totalIntensity = Math.min(1, armIntensity + centerGlow + dustNoise + starNoise);
        const value = 255 * (1 - totalIntensity);
        
        data[index] = value;     // R
        data[index + 1] = value; // G
        data[index + 2] = value; // B
        data[index + 3] = 255;   // A
      }
    }
  }
}
