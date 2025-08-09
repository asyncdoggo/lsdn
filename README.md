# Random Black & White Image Generator

A sophisticated TypeScript web application that generates coherent black and white images with multiple pattern algorithms and customizable resolutions.

## Features

- 🎨 **Multiple Pattern Types**:
  - **Pure Random Noise**: Classic random black/white pixels
  - **Perlin-like Noise**: Smooth, cloud-like organic patterns
  - **Cellular Automata**: Cave-like structures using cellular automaton rules
  - **Fractal Patterns**: Mathematical Mandelbrot set visualizations
  - **Maze Structures**: Labyrinth-like connected pathways
  - **Voronoi Diagrams**: Natural cell-based tessellations
  - **Wave Interference**: Ripple and interference patterns
  - **⚡ Lightning/Cracks**: Realistic electrical discharge patterns
  - **☁️ Cloud Formation**: Turbulent atmospheric patterns
  - **🗿 Marble Texture**: Natural stone veining and swirls
  - **🌳 Wood Grain**: Tree ring and grain patterns
  - **🔌 Circuit Board**: Electronic circuit layouts and traces
  - **🏔️ Terrain/Mountains**: Landscape silhouettes and peaks
  - **🌿 Organic Growth**: Natural branching and growth structures

- 📐 **Multiple Resolution Options**:
  - 4 MP (2048x1952 pixels)
  - 8 MP (2896x2760 pixels) 
  - 12 MP (3456x3456 pixels)

- 💾 **Download** generated images as PNG files
- 📱 **Responsive design** that works on all devices
- 🌙 **Dark/Light theme** support
- ⚡ **Optimized rendering** with progress indication

## How to Use

1. Select your desired **resolution** from the first dropdown menu
2. Choose a **pattern type** from the second dropdown to determine the style of randomness
3. Click **"Generate Random Image"** to create a new pattern
4. Click **"Download Image"** to save the generated image to your device

## Pattern Descriptions

- **Pure Random Noise**: Each pixel is randomly black or white with no correlation
- **Perlin-like Noise**: Smooth transitions create cloud-like or terrain-like patterns
- **Cellular Automata**: Uses Conway's Game of Life-style rules to create organic cave structures
- **Fractal Patterns**: Mathematical Mandelbrot set creates intricate self-similar boundaries
- **Maze Structures**: Generates connected labyrinth patterns using backtracking algorithms
- **Voronoi Diagrams**: Creates natural cell-like patterns based on distance to random seed points
- **Wave Interference**: Simulates wave interference patterns creating ripple effects
- **Lightning/Cracks**: Uses diffusion-limited aggregation to create realistic branching patterns
- **Cloud Formation**: Multi-octave turbulent noise simulates realistic cloud formations
- **Marble Texture**: Combines noise with sinusoidal veining to mimic natural marble
- **Wood Grain**: Radial patterns with noise create realistic tree ring and grain effects
- **Circuit Board**: Generates electronic circuit layouts with pads and connecting traces
- **Terrain/Mountains**: Multi-layer mountain silhouettes with realistic elevation profiles
- **Organic Growth**: Diffusion-limited aggregation creates natural branching structures

## Development

This project uses:
- **TypeScript** for type safety and better development experience
- **Vite** for fast development and building
- **HTML5 Canvas** for efficient image generation
- **Modern CSS** with responsive design

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build locally

### Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Start development server:
   ```bash
   npm run dev
   ```

3. Open your browser and navigate to the provided local URL (usually `http://localhost:5173`)

### Building for Production

```bash
npm run build
```

The built files will be in the `dist` directory.

## Technical Details

The application uses HTML5 Canvas API to generate pixel-perfect black and white images. The random generation algorithm creates pure black or white pixels for high contrast patterns.

The canvas rendering is optimized for performance, and the display scaling ensures the generated images fit well within the browser viewport while maintaining the original resolution for download.

## Browser Compatibility

This application works in all modern browsers that support:
- HTML5 Canvas API
- ES6+ JavaScript features
- CSS Grid and Flexbox

## License

MIT License - feel free to use this code for your own projects!
