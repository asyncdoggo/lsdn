# Completely vibe coded hell mess of a image pattern generator with text to image (using WebGPU)

> I am just going to let copilot do the work of explaining what its made

A cutting-edge web application that transforms your text prompts into stunning high-quality images using state-of-the-art diffusion models running directly in your browser with WebGPU acceleration.


## 🎨 Pattern Generation Mode
Classic algorithmic pattern generation:
- **Pure Noise**: Random black/white pixel patterns
- **Perlin Noise**: Smooth, organic cloud-like textures
- **Wave Patterns**: Mathematical wave interference
- **TV Static**: Retro television noise simulation
  
<span style="display:inline-block; animation: pulse 1s infinite; font-weight:bold; color:#ff69b4;">✨ And a Lot More ✨</span>

<style>
@keyframes pulse {
  0% { opacity: 1; }
  50% { opacity: 0.4; }
  100% { opacity: 1; }
}
</style>


## 🎨 Text-to-Image Generation

Transform any text description into beautiful, detailed images:

- 🖼️ **High-Quality Output**: Generate crisp, detailed images from simple text prompts
- ⚡ **Real-Time Generation**: Watch your images come to life step-by-step
- 🎯 **Precise Control**: Fine-tune every aspect with advanced parameters
- 🧠 **AI-Powered**: Uses cutting-edge diffusion model technology
- 💻 **Browser-Native**: No server required - everything runs locally with WebGPU


### ⚠️ Text to image NOT SUPPORTED:
- Integrated graphics (Basic ass poor hardware)
- Old GPUs (Old ass Nvidia GTX 10-series and older)
- Mobile devices (Don't even think about it)
- Budget laptops without dedicated graphics (Imagine being so poor)

**If you don't have a proper GPU, stick to the pattern generation mode.**


### 🤖 Text-to-Image Mode
<!-- Write about how we put stable diffusion -->
Runs Stable Diffusion in the browser, using ONNX Runtime Web [https://onnxruntime.ai/].

### Prerequisites
1. **Check GPU Support**: Your browser must support WebGPU
2. **Hardware Check**: Ensure you have a dedicated (Nvidia only?) GPU with 4GB+ VRAM
3. **Browser**: Check [chrome://gpu](chrome://gpu)