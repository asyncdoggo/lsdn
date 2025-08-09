export class NoisePattern {
  /**
   * Generates pure random noise pattern
   */
  static generate(data: Uint8ClampedArray): void {
    for (let i = 0; i < data.length; i += 4) {
      const value = Math.random() > 0.5 ? 255 : 0;
      data[i] = value;
      data[i + 1] = value;
      data[i + 2] = value;
      data[i + 3] = 255;
    }
  }
}
