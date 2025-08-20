import './style.css'
import { TextToImageGenerator } from './textToImageGenerator'
import type { SchedulerType } from './schedulers'
import { appTemplate } from './templates'
import { setBaseUrl } from './core/modelManager'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = appTemplate

const generator = new TextToImageGenerator()

// Get elements
const canvas = document.querySelector<HTMLCanvasElement>('#imageCanvas')!
const generateBtn = document.querySelector<HTMLButtonElement>('#generate')!
const stopBtn = document.querySelector<HTMLButtonElement>('#stop')!
const downloadBtn = document.querySelector<HTMLButtonElement>('#download')!
const statusSection = document.querySelector('.status-section') as HTMLDivElement;
const loadingText = document.querySelector('.loading-text') as HTMLParagraphElement;

// Text-to-image elements
const promptInput = document.querySelector<HTMLTextAreaElement>('#promptInput')!;
const negativePromptInput = document.querySelector<HTMLTextAreaElement>('#negativePromptInput')!;
const stepsSlider = document.querySelector<HTMLInputElement>('#stepsSlider')!;
const guidanceSlider = document.querySelector<HTMLInputElement>('#guidanceSlider')!;
const schedulerSelect = document.querySelector<HTMLSelectElement>('#schedulerSelect')!;
const seedInput = document.querySelector<HTMLInputElement>('#seedInput')!;
const tiledVAECheck = document.querySelector<HTMLInputElement>('#tiledVAECheck')!;
const lowMemoryCheck = document.querySelector<HTMLInputElement>('#lowMemory')!;
const tileSizeSlider = document.querySelector<HTMLInputElement>('#tileSizeSlider')!;
const tileSizeGroup = document.querySelector<HTMLElement>('#tileSizeGroup')!;
const stepsValue = document.querySelector('#stepsValue')!;
const guidanceValue = document.querySelector('#guidanceValue')!;
const tileSizeValue = document.querySelector('#tileSizeValue')!;
const modelStatus = document.querySelector('#modelStatus')!;
const loadModelsBtn = document.querySelector<HTMLButtonElement>('#loadModelsBtn')!;
const modelSelect = document.querySelector<HTMLSelectElement>('#modelSelect')!;
const widthSlider = document.querySelector<HTMLInputElement>('#widthSlider')!;
const heightSlider = document.querySelector<HTMLInputElement>('#heightSlider')!;
const widthValue = document.querySelector<HTMLElement>('#widthValue')!;
const heightValue = document.querySelector<HTMLElement>('#heightValue')!;

// Resolution slider events
widthSlider.addEventListener('input', () => {
  widthValue.textContent = widthSlider.value;
});

heightSlider.addEventListener('input', () => {
  heightValue.textContent = heightSlider.value;
});

// Model select dropdown
modelSelect.addEventListener('change', () => {
  const selectedModel = modelSelect.value;
  setBaseUrl(selectedModel);
  console.log('Selected model:', selectedModel);
});


// Resolution slider events
widthSlider.addEventListener('input', () => {
  widthValue.textContent = widthSlider.value;
});

heightSlider.addEventListener('input', () => {
  heightValue.textContent = heightSlider.value;
});

modelSelect.addEventListener('change', () => {
  const selectedModel = modelSelect.value;
  setBaseUrl(selectedModel);
  console.log('Selected model:', selectedModel);
});

// Text-to-image slider updates
stepsSlider.addEventListener('input', () => {
  stepsValue.textContent = stepsSlider.value;
});

guidanceSlider.addEventListener('input', () => {
  guidanceValue.textContent = guidanceSlider.value;
});

// Tiled VAE checkbox
tiledVAECheck.addEventListener('change', () => {
  tileSizeGroup.style.display = tiledVAECheck.checked ? 'block' : 'none';
});

// Tile size slider
tileSizeSlider.addEventListener('input', () => {
  tileSizeValue.textContent = tileSizeSlider.value;
});

// Load models button
loadModelsBtn.addEventListener('click', async () => {
  if (!("gpu" in navigator)) {
    alert('GPU is needed to run. Please use a compatible browser with WebGPU support.');
    return;
  }

  if (loadModelsBtn.disabled) return;
  
  loadModelsBtn.disabled = true;
  const originalText = loadModelsBtn.querySelector('.btn-text')?.textContent || 'Load AI Models';
  const btnText = loadModelsBtn.querySelector('.btn-text');
  
  try {
    updateModelStatus('loading', 'Loading models...');
    if (btnText) btnText.textContent = 'Loading...';

    const width = parseInt(widthSlider.value);
    const height = parseInt(heightSlider.value);

    await generator.loadModels((stage: string, progress: number) => {
      updateModelStatus('loading', `${stage} (${Math.round(progress * 100)}%)`);
    }, { height, width });

    updateModelStatus('ready', 'Models loaded and ready');
    if (btnText) btnText.textContent = 'Models Loaded ✓';
    loadModelsBtn.style.display = 'none';
    document.querySelector('#unloadModelsBtn')?.classList.remove('hidden');
    
  } catch (error) {
    console.error('Failed to load models:', error);
    updateModelStatus('error', 'Failed to load models');
    if (btnText) btnText.textContent = originalText;
    loadModelsBtn.disabled = false;
  }
});

// Unload models button
document.querySelector('#unloadModelsBtn')?.addEventListener('click', async () => {
  const unloadBtn = document.querySelector('#unloadModelsBtn') as HTMLButtonElement;
  if (!unloadBtn || unloadBtn.disabled) return;

  try {
    unloadBtn.disabled = true;
    const btnText = unloadBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Unloading...';

    updateModelStatus('loading', 'Unloading models...');
    await generator.dispose();

    updateModelStatus('not-loaded', 'Models not loaded');
    unloadBtn.classList.add('hidden');
    loadModelsBtn.style.display = 'flex';
    loadModelsBtn.disabled = false;
    const loadBtnText = loadModelsBtn.querySelector('.btn-text');
    if (loadBtnText) loadBtnText.textContent = 'Load AI Models';

  } catch (error) {
    console.error('Failed to unload models:', error);
    updateModelStatus('error', 'Failed to unload models');
    unloadBtn.disabled = false;
    const btnText = unloadBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Unload Models';
  }
});

// Model status update function
function updateModelStatus(status: 'loading' | 'ready' | 'error' | 'not-loaded', message: string) {
  const statusDot = modelStatus.querySelector('.status-dot') as HTMLElement;
  const statusText = modelStatus.querySelector('.status-text') as HTMLElement;
  
  statusDot.className = `status-dot status-${status}`;
  statusText.textContent = message;
}

// Text-to-image slider updates
stepsSlider.addEventListener('input', () => {
  stepsValue.textContent = stepsSlider.value;
});

guidanceSlider.addEventListener('input', () => {
  guidanceValue.textContent = guidanceSlider.value;
});

// Tiled VAE checkbox
tiledVAECheck.addEventListener('change', () => {
  tileSizeGroup.style.display = tiledVAECheck.checked ? 'block' : 'none';
});

// Tile size slider
tileSizeSlider.addEventListener('input', () => {
  tileSizeValue.textContent = tileSizeSlider.value;
});

// Generate button
generateBtn.addEventListener('click', async () => {
  if (generateBtn.disabled) return; // Prevent double-clicks
  
  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  statusSection.classList.remove('hidden');
  stopBtn.style.display = 'flex';
  stopBtn.disabled = false;
  
  // Update button text to show it's generating
  const btnText = generateBtn.querySelector('.btn-text');
  const originalText = btnText?.textContent || 'Generate';
  if (btnText) btnText.textContent = 'Generating...';
  
  try {
    const prompt = promptInput.value.trim();
    if (!prompt) {
      alert('Please enter a text prompt');
      return;
    }
    
    if (!generator.modelsLoaded) {
      alert('AI models are not loaded. Please click "Load AI Models" first.');
      return;
    }

    const width = parseInt(widthSlider.value);
    const height = parseInt(heightSlider.value);

    const options = {
      prompt,
      height,
      width,
      negativePrompt: negativePromptInput.value.trim(),
      steps: parseInt(stepsSlider.value),
      guidance: parseFloat(guidanceSlider.value),
      scheduler: schedulerSelect.value as SchedulerType,
      seed: seedInput.value ? parseInt(seedInput.value) : undefined,
      useTiledVAE: tiledVAECheck.checked,
      lowMemoryMode: lowMemoryCheck.checked,
      tileSize: parseInt(tileSizeSlider.value)
    };
    
    const imageData = await generator.generateImage(
      options,
      (stage: string, progress: number) => {
        if (loadingText) loadingText.textContent = `${stage} (${Math.round(progress * 100)}%)`;
      },
      (previewImageData: ImageData) => {
        // Update canvas with preview during generation
        const ctx = canvas.getContext('2d');
        if (ctx) {
          // Set canvas to match preview image size
          canvas.width = previewImageData.width;
          canvas.height = previewImageData.height;

          // Clear the canvas explicitly
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          // Draw the preview
          ctx.putImageData(previewImageData, 0, 0);
          
          // Scale canvas display size while maintaining aspect ratio
          canvas.style.width = `${width}px`;
          canvas.style.height = `${height}px`;
          // Use smooth scaling for preview
          canvas.style.imageRendering = 'auto';
        }
      }
    );

    // Update canvas with final image
    const ctx = canvas.getContext('2d');
    if (ctx && imageData) {
      canvas.width = imageData.width;
      canvas.height = imageData.height;
      ctx.putImageData(imageData, 0, 0);
    }
    
    downloadBtn.disabled = false;
  } catch (error) {
    console.error('Error generating image:', error);
    alert(`Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    generateBtn.disabled = false;
    stopBtn.style.display = 'none';
    stopBtn.disabled = true;
    // Reset stop button text
    const stopBtnText = stopBtn.querySelector('.btn-text');
    if (stopBtnText) stopBtnText.textContent = 'Stop';
    statusSection.classList.add('hidden');
    if (btnText) btnText.textContent = originalText;
    if (loadingText) loadingText.textContent = 'Generating...';
  }
});

// Stop button
stopBtn.addEventListener('click', () => {
  if (!stopBtn.disabled) {
    generator.cancelGeneration();
    stopBtn.disabled = true;
    const btnText = stopBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Stopping...';
    if (loadingText) loadingText.textContent = 'Stopping generation...';
  }
});

// Download button
downloadBtn.addEventListener('click', () => {
  const prompt = promptInput.value.trim().slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
  const filename = `ai-generated-${prompt}-${Date.now()}.png`;
  const link = document.createElement('a');
  link.download = filename;
  link.href = canvas.toDataURL('image/png');
  link.click();
});


