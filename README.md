# LSDN

URL: [https://lsdn.netlify.app](https://lsdn.netlify.app)

A modern, browser-based implementation of Stable Diffusion that runs entirely client-side using WebGPU acceleration. <b>Now with an LLM chat too!</b>

GPU is mandatory. Maybe NVIDIA only? (cpu users can still use text chat)

## Features

### Core Features
- Runs completely in browser with WebGPU hardware acceleration
- No servers or installations required
- Real-time generation preview
- LLM chat support

### Advanced Features
- Tiled VAE decoding
- Attention control for prompt weights
- Generation history

### Usage for prompt weighting
To use prompt weighting, simply wrap the text you want to emphasize in parentheses and specify a weight. For example:
- `cat (fluffy)`: fluffy will be emphasized with a weight of 1.1.
- `cat ((fluffy))`: fluffy will be emphasized with a weight of 1.21.
- `cat [fluffy]`: fluffy will be emphasized with a weight of 0.9.
- `cat (fluffy:1.5)`: fluffy will be emphasized with a weight of 1.5.

### Generation Options
- Text-to-Image generation
- Multiple sampling methods:
  - Euler (Ancestral)
  - Heun
  - DPM++ 2M SDE
  - DDPM
  - LMS Karras
  - More to come


## Requirements

- Chrome/Edge Canary or Chrome 113+ with WebGPU enabled
- Dedicated GPU with 4GB+ VRAM (NVIDIA only?)
- WebGPU-compatible graphics drivers
- Operating System: Windows/Linux/macOS with WebGPU support

I have tested this on a NVIDIA GTX 1650 4GB VRAM.

## Installation

1. Clone the repository
```bash
git clone https://github.com/asyncdoggo/LSDN.git
cd LSDN
```

2. Install dependencies
```bash
npm install
```

3. Start the development server
```bash
npm run dev
```

4. Open in a WebGPU-enabled browser: http://localhost:5173


## Models:
These are the models I have converted to onnx:
- [Small Stable Diffusion v0](https://huggingface.co/subpixel/small-stable-diffusion-v0-onnx-ort-web) 
  - A lightweight version of Stable Diffusion
- [animeanything_v10-onnx](https://huggingface.co/subpixel/animeanything_v10-onnx) 
  - A model for generating anime-style images
- [Typhoon-SD15-V2-onnx](https://huggingface.co/subpixel/Typhoon-SD15-V2-onnx) 
  - A model for generating more realistic-styled images

## Stuff
- Ensure hardware acceleration is enabled in your browser. Check [chrome://gpu](chrome://gpu)
- Use latest Chrome or whatever browser you prefer that has WebGPU support
- Adjust tile size based on available GPU memory
- Recommended step count: 20-30 for optimal speed/quality
- Lower resolutions provide faster generation
- Monitor VRAM usage in browser task manager
- At least one of width or height must be 512px because of some model constraints.

## Development

Pull requests and contributions are welcome. Although this is just a hobby project, I appreciate any help or feedback.

### Building from Source
```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build
```

## License

This project is licensed under the MIT License - see [LICENSE](LICENSE) for details.

## Acknowledgments

- Runs stable diffusion models using the onnx runtime [onnxruntime-web](https://github.com/microsoft/onnxruntime)

- Runs LLM using [mlc-llm](https://github.com/mlc-ai/mlc-llm)

## Support and Issues

For bug reports and feature requests, please use [GitHub Issues](https://github.com/asyncdoggo/lsdn/issues).