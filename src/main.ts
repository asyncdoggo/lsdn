import './style.css'
import { ImageGenerator, type PatternType, type ResolutionKey } from './imageGenerator'
import type { SchedulerType } from './schedulers'
import { appTemplate } from './templates'
import { setBaseUrl } from './core/modelManager'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = appTemplate

const imageGenerator = new ImageGenerator()

// State management
let currentResolution: ResolutionKey = '1536';
let currentPattern: PatternType = 'noise';
let isColorMode: boolean = false;
let generationMode: 'pattern' | 'text' = 'pattern';

// Get elements
const canvas = document.querySelector<HTMLCanvasElement>('#imageCanvas')!
const generateBtn = document.querySelector<HTMLButtonElement>('#generate')!
const stopBtn = document.querySelector<HTMLButtonElement>('#stop')!
const downloadBtn = document.querySelector<HTMLButtonElement>('#download')!
const statusSection = document.querySelector('.status-section') as HTMLDivElement;
const loadingText = document.querySelector('.loading-text') as HTMLParagraphElement;

// Resolution elements
const widthSlider = document.querySelector<HTMLInputElement>('#widthSlider')!;
const heightSlider = document.querySelector<HTMLInputElement>('#heightSlider')!;
const widthValue = document.querySelector<HTMLElement>('#widthValue')!;
const heightValue = document.querySelector<HTMLElement>('#heightValue')!;

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
const tileSizeGroup = document.querySelector<HTMLElement>('#tileSizeGroup')!;;
const stepsValue = document.querySelector('#stepsValue')!;
const guidanceValue = document.querySelector('#guidanceValue')!;
const tileSizeValue = document.querySelector('#tileSizeValue')!;
const modelStatus = document.querySelector('#modelStatus')!;
const loadModelsBtn = document.querySelector<HTMLButtonElement>('#loadModelsBtn')!;
const modelSelect = document.querySelector<HTMLSelectElement>('#modelSelect')!;

// Resolution buttons
const resolutionButtons = document.querySelectorAll('.resolution-btn');
resolutionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    resolutionButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentResolution = btn.getAttribute('data-resolution') as ResolutionKey;
  });
});

// Color mode buttons
const colorButtons = document.querySelectorAll('.color-btn');
colorButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    colorButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    isColorMode = btn.getAttribute('data-color') === 'true';
  });
});

// Generation mode buttons
const modeButtons = document.querySelectorAll('.mode-btn');
const patternSection = document.querySelector('.pattern-section') as HTMLElement;
const textToImageSection = document.querySelector('.text-to-image-section') as HTMLElement;
const colorSection = document.querySelector('.color-section') as HTMLElement;

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    generationMode = btn.getAttribute('data-mode') as 'pattern' | 'text';
    
    // Toggle UI sections
    if (generationMode === 'text') {
      patternSection.classList.add('hidden');
      textToImageSection.classList.remove('hidden');
      colorSection.classList.add('hidden'); // Hide color mode for text-to-image
      
      // Show sliders and hide buttons for text-to-image mode
      document.querySelector('.resolution-buttons')?.classList.add('hidden');
      document.querySelector('.resolution-sliders')?.classList.remove('hidden');
      
      // Initialize sliders with default values
      widthSlider.value = '512';
      heightSlider.value = '512';
      widthValue.textContent = '512';
      heightValue.textContent = '512';
      currentResolution = '512x512' as ResolutionKey;
    } else {
      patternSection.classList.remove('hidden');
      textToImageSection.classList.add('hidden');
      colorSection.classList.remove('hidden'); // Show color mode for patterns
      
      // Show buttons and hide sliders for pattern mode
      document.querySelector('.resolution-buttons')?.classList.remove('hidden');
      document.querySelector('.resolution-sliders')?.classList.add('hidden');
      
      // Reset to default pattern resolution
      currentResolution = '1536';
    }
  });
});


// Resolution slider events
widthSlider.addEventListener('input', () => {
  widthValue.textContent = widthSlider.value;
  currentResolution = `${widthSlider.value}x${heightSlider.value}` as ResolutionKey;
});

heightSlider.addEventListener('input', () => {
  heightValue.textContent = heightSlider.value;
  currentResolution = `${widthSlider.value}x${heightSlider.value}` as ResolutionKey;
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

    await imageGenerator.initializeTextToImage((stage, progress) => {
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
    await imageGenerator.disposeTextToImage();

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

// Category tabs
const categoryTabs = document.querySelectorAll('.category-tab');
const patternCategories = document.querySelectorAll('.pattern-category');

categoryTabs.forEach(tab => {
  tab.addEventListener('click', () => {
    const category = tab.getAttribute('data-category') as string;
    
    // Update active tab
    categoryTabs.forEach(t => t.classList.remove('active'));
    tab.classList.add('active');
    
    // Show corresponding pattern category
    patternCategories.forEach(cat => {
      const catElement = cat as HTMLElement;
      if (catElement.getAttribute('data-category') === category) {
        catElement.classList.remove('hidden');
      } else {
        catElement.classList.add('hidden');
      }
    });
    
    // Select first pattern in the new category
    const firstPattern = document.querySelector(`.pattern-category[data-category="${category}"] .pattern-card`) as HTMLElement;
    if (firstPattern) {
      // Clear all active pattern cards
      document.querySelectorAll('.pattern-card').forEach(card => card.classList.remove('active'));
      firstPattern.classList.add('active');
      currentPattern = firstPattern.getAttribute('data-pattern') as PatternType;
    }
  });
});

// Pattern cards
const patternCards = document.querySelectorAll('.pattern-card');
patternCards.forEach(card => {
  card.addEventListener('click', () => {
    // Only allow selection within the current category
    const parentCategory = card.closest('.pattern-category') as HTMLElement;
    if (parentCategory && !parentCategory.classList.contains('hidden')) {
      patternCards.forEach(c => c.classList.remove('active'));
      card.classList.add('active');
      currentPattern = card.getAttribute('data-pattern') as PatternType;
    }
  });
});

// Generate button
generateBtn.addEventListener('click', async () => {
  if (generateBtn.disabled) return; // Prevent double-clicks
  
  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  statusSection.classList.remove('hidden');
  
  // Show stop button for text-to-image generation
  if (generationMode === 'text') {
    stopBtn.style.display = 'flex';
    stopBtn.disabled = false;
  }
  
  // Update button text to show it's generating
  const btnText = generateBtn.querySelector('.btn-text');
  const originalText = btnText?.textContent || 'Generate';
  if (btnText) btnText.textContent = 'Generating...';
  
  try {
    if (generationMode === 'text') {
      // Text-to-image generation
      const prompt = promptInput.value.trim();
      if (!prompt) {
        alert('Please enter a text prompt');
        return;
      }
      
      if (!imageGenerator.isTextToImageReady) {
        alert('AI models are not loaded. Please click "Load AI Models" first.');
        return;
      }

      const width = parseInt(widthSlider.value);
      const height = parseInt(heightSlider.value);

      const options = {
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
      
      await imageGenerator.generateFromText(
        canvas, 
        prompt, 
        options,
        (stage, progress) => {
          if (loadingText) loadingText.textContent = `${stage} (${Math.round(progress * 100)}%)`;
        },
        (previewImageData) => {
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
      
    } else {
      // Pattern generation
      if (loadingText) loadingText.textContent = 'Generating pattern...';
      
      await imageGenerator.generatePatternImageAsync(
        canvas, 
        currentResolution, 
        currentPattern, 
        isColorMode
      );
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
  if (generationMode === 'text' && !stopBtn.disabled) {
    imageGenerator.cancelTextToImageGeneration();
    stopBtn.disabled = true;
    const btnText = stopBtn.querySelector('.btn-text');
    if (btnText) btnText.textContent = 'Stopping...';
    if (loadingText) loadingText.textContent = 'Stopping generation...';
  }
});

// Download button
downloadBtn.addEventListener('click', () => {
  let filename: string;
  
  if (generationMode === 'text') {
    const prompt = promptInput.value.trim().slice(0, 30).replace(/[^a-zA-Z0-9]/g, '_');
    filename = `ai-generated-${prompt}-${Date.now()}.png`;
  } else {
    filename = `random-bw-image-${currentPattern}-${currentResolution}-${Date.now()}.png`;
  }
  
  imageGenerator.downloadImage(canvas, filename);
});

// Initialize with default values on page load
setTimeout(() => {
  generateBtn.click();
}, 500);
