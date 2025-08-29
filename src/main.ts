import './style.css'
import { TextToImageGenerator } from './textToImageGenerator'
import type { SchedulerType } from './schedulers'
import { appTemplate } from './templates'
import { setBaseUrl } from './core/modelManager'
import { History } from './utils/history'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = appTemplate

const generator = new TextToImageGenerator()
const history = History.getInstance();

// Get elements
const canvas = document.querySelector<HTMLCanvasElement>('#imageCanvas')!
const generateBtn = document.querySelector<HTMLButtonElement>('#generate')!
const stopBtn = document.querySelector<HTMLButtonElement>('#stop')!
const downloadBtn = document.querySelector<HTMLButtonElement>('#download')!
const statusSection = document.querySelector('.status-section') as HTMLDivElement;
const loadingText = document.querySelector('.loading-text') as HTMLParagraphElement;
const historySelect = document.querySelector<HTMLSelectElement>('#history')!;

// Initialize history dropdown
async function updateHistoryDropdown() {
  const entries = await history.getEntries();
  historySelect.innerHTML = '<option value="">History</option>';
  
  entries.forEach(entry => {
    const option = document.createElement('option');
    option.value = entry.id;
    option.textContent = `${entry.options.prompt.slice(0, 30)}... (${new Date(entry.timestamp).toLocaleTimeString()})`;
    historySelect.appendChild(option);
  });
}

// Load history when a selection is made
historySelect.addEventListener('change', async () => {
  const selectedId = historySelect.value;
  if (!selectedId) return;

  const entry = await history.getEntry(selectedId);
  if (!entry) return;

  // Restore all settings from history
  promptInput.value = entry.options.prompt;
  negativePromptInput.value = entry.options.negativePrompt || '';
  stepsSlider.value = entry.options.steps.toString();
  stepsValue.textContent = entry.options.steps.toString();
  guidanceSlider.value = entry.options.guidance.toString();
  guidanceValue.textContent = entry.options.guidance.toString();
  schedulerSelect.value = entry.options.scheduler || 'euler-karras';
  seedInput.value = entry.options.seed?.toString() || '';
  tiledVAECheck.checked = entry.options.useTiledVAE || false;
  lowMemoryCheck.checked = entry.options.lowMemoryMode || false;
  widthSlider.value = entry.options.width.toString();
  widthValue.textContent = entry.options.width.toString();
  heightSlider.value = entry.options.height.toString();
  heightValue.textContent = entry.options.height.toString();
  
  if (entry.options.tileSize) {
    tileSizeSlider.value = entry.options.tileSize.toString();
    tileSizeValue.textContent = entry.options.tileSize.toString();
  }
  
  tileSizeGroup.style.display = tiledVAECheck.checked ? 'block' : 'none';

  // Set model and update base URL
  if (entry.options.model) {
    modelSelect.value = entry.options.model;
    setBaseUrl(entry.options.model);
  }

  // Restore preview image if available
  if (entry.previewUrl) {
    const img = new Image();
    img.onload = () => {
      const ctx = canvas.getContext('2d');
      if (ctx) {
        canvas.width = entry.options.width;
        canvas.height = entry.options.height;
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        
        // Enable download button since we have an image
        downloadBtn.disabled = false;
      }
    };
    img.src = entry.previewUrl;
  }

  // Reset selection
  historySelect.value = '';
});

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
const modelSelect = document.querySelector<HTMLSelectElement>('#modelSelect')!;
const widthSlider = document.querySelector<HTMLInputElement>('#widthSlider')!;
const heightSlider = document.querySelector<HTMLInputElement>('#heightSlider')!;
const widthValue = document.querySelector<HTMLElement>('#widthValue')!;
const heightValue = document.querySelector<HTMLElement>('#heightValue')!;
const clearHistory = document.querySelector<HTMLButtonElement>('#clearHistory')!;
const randomizeSeed = document.querySelector<HTMLInputElement>('#randomizeSeed')!;
const clearCacheButton = document.querySelector<HTMLButtonElement>('#clearCacheButton')!;

const imgPromptInput = document.querySelector<HTMLInputElement>('#imgPromptInput')!;
const imgPromptStrength = document.querySelector<HTMLInputElement>('#imgPromptStrength')!;
let imgPromptStrengthValue = document.querySelector<HTMLElement>('#imgPromptStrengthValue')!;

// <div class="img-prompt">
//         <label for="imgPromptInput">Image Prompt (Optional)</label>
//         <!-- Info icon -->
//         <div class="info-icon" title="Use an image to guide the generation process."  id="infoIcon">
//           <img src="info.png" alt="Info">
//         </div>
//         <input type="file" id="imgPromptInput" accept="image/*" />
//         <label for="imgPromptStrength">Image Prompt Strength: <span id="imgPromptStrengthValue">0.5</span></label>
//         <input type="range" id="imgPromptStrength" min="0" max="1" step="0.1" value="0.5" />
//       </div>

let imagePrompt: HTMLImageElement | null = null;

imgPromptInput.addEventListener('change', () => {
  const file = imgPromptInput.files?.[0];
  if (file) {
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        imagePrompt = img;
      };
      img.src = reader.result as string;
    };
    reader.readAsDataURL(file);
  }
});

imgPromptStrength.addEventListener('input', () => {
  imgPromptStrengthValue.textContent = imgPromptStrength.value;
});



window.addEventListener('unhandledrejection', event => {
  const reason = event.reason;

  // Detect GPU/WebGPU related errors
  const isGpuError = reason instanceof DOMException &&
    reason.name === 'AbortError' &&
    /mapAsync|GPUBuffer|GPU/i.test(reason.message);

  if (isGpuError) {
    console.error('GPU/WebGPU error detected:', reason);

    alert("There was a GPU error while running the model. Please reload the page and try again.");
    window.location.reload();

  } else {
    console.error('Unhandled rejection caught:', reason);
  }
});


// Resolution slider events
widthSlider.addEventListener('input', () => {
  widthValue.textContent = widthSlider.value;
});

heightSlider.addEventListener('input', () => {
  heightValue.textContent = heightSlider.value;
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


clearHistory.addEventListener('click', async () => {
  historySelect.options.length = 0; // Clear dropdown options
  historySelect.value = 'History';
  history.clear();
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

clearCacheButton.addEventListener('click', async () => {
  // confirmation
  const confirmed = confirm("This will delete downloaded models from your browser, are you sure?");
  if (confirmed) {
    await generator.clearCache();
  }
});

function processImage(imageData: ImageData) {
  // If the image height or width is greater than 512 then resize the image to have the smallest dimension be 512
  const maxDimension = 512;
  let { width, height } = imageData;

  if (width > maxDimension || height > maxDimension) {
    const scale = Math.min(maxDimension / width, maxDimension / height);
    width = Math.round(width * scale);
    height = Math.round(height * scale);
  }

  // Make sure that new width and height is divisible by 64
  width = Math.floor(width / 64) * 64;
  height = Math.floor(height / 64) * 64;

  console.log('Resized image dimensions:', width, height);

  // Create a new canvas to draw the resized image
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d')!;
  ctx.putImageData(imageData, 0, 0);

  return ctx.getImageData(0, 0, width, height);
}

// Generate button
generateBtn.addEventListener('click', async () => {
  if (!("gpu" in navigator)) {
    alert('GPU is needed to run. Please use a compatible browser with WebGPU support.');
    return;
  }
  
  if (generateBtn.disabled) return; // Prevent double-clicks

  
  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  clearCacheButton.disabled = true;
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

    let image = null;

    if (imagePrompt) {
      // Get image bytes and call process image function
      const canvas = document.createElement('canvas');
      canvas.width = imagePrompt.width;
      canvas.height = imagePrompt.height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(imagePrompt, 0, 0);
        const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
        image = processImage(imageData);
      }
    }

    const width = parseInt(widthSlider.value);
    const height = parseInt(heightSlider.value);
    let actualSeed: number = parseInt(seedInput.value);

    // Handle seed generation and setting
    if (randomizeSeed.checked) {
      actualSeed = Math.floor(Math.random() * 0xFFFFFFFF);
    }

    if (isNaN(actualSeed)) {
      actualSeed = Math.floor(Math.random() * 0xFFFFFFFF);
    }
    seedInput.value = actualSeed.toString();

    const options = {
      prompt,
      height,
      width,
      negativePrompt: negativePromptInput.value.trim(),
      steps: parseInt(stepsSlider.value),
      guidance: parseFloat(guidanceSlider.value),
      scheduler: schedulerSelect.value as SchedulerType,
      seed: actualSeed,
      useTiledVAE: tiledVAECheck.checked,
      lowMemoryMode: lowMemoryCheck.checked,
      tileSize: parseInt(tileSizeSlider.value),
      model: modelSelect.value,
      imagePrompt: {
        image: image,
        strength: parseFloat(imgPromptStrength.value)
      }
    };

    actualSeed = Math.floor(Math.random() * 0xFFFFFFFF);

    // Create history entry before starting generation
    // const historyId = await history.addEntry(options);
    updateHistoryDropdown();
    
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

      // Update history entry with preview
      const previewUrl = canvas.toDataURL('image/png');
      // history.updateEntry(historyId, { previewUrl });
      updateHistoryDropdown();
    }
    
    downloadBtn.disabled = false;
  } catch (error) {
    console.error('Error generating image:', error);
    alert(`Error generating image: ${error instanceof Error ? error.message : 'Unknown error'}`);
  } finally {
    generateBtn.disabled = false;
    clearCacheButton.disabled = false;
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

// Initialize history dropdown
updateHistoryDropdown();
