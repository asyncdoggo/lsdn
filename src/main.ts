import './style.css'
import { ImageGenerator, type PatternType, type ResolutionKey } from './imageGenerator'
import type { SchedulerType } from './schedulers'
import { appTemplate } from './templates'

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
const canvasOverlay = document.querySelector('.canvas-overlay') as HTMLDivElement;
const loadingText = document.querySelector('.loading-text') as HTMLParagraphElement;

// Text-to-image elements
const promptInput = document.querySelector<HTMLTextAreaElement>('#promptInput')!;
const negativePromptInput = document.querySelector<HTMLTextAreaElement>('#negativePromptInput')!;
const stepsSlider = document.querySelector<HTMLInputElement>('#stepsSlider')!;
const guidanceSlider = document.querySelector<HTMLInputElement>('#guidanceSlider')!;
const schedulerSelect = document.querySelector<HTMLSelectElement>('#schedulerSelect')!;
const seedInput = document.querySelector<HTMLInputElement>('#seedInput')!;
const stepsValue = document.querySelector('#stepsValue')!;
const guidanceValue = document.querySelector('#guidanceValue')!;
const modelStatus = document.querySelector('#modelStatus')!;
const loadModelsBtn = document.querySelector<HTMLButtonElement>('#loadModelsBtn')!;

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
    
    // Get 64px button
    const res64Btn = document.querySelector('[data-resolution="64"]') as HTMLElement;
    
    // Toggle UI sections
    if (generationMode === 'text') {
      patternSection.classList.add('hidden');
      textToImageSection.classList.remove('hidden');
      colorSection.classList.add('hidden'); // Hide color mode for text-to-image
      
      // Add testing note to 64px button
      if (res64Btn && !res64Btn.querySelector('.testing-note')) {
        res64Btn.innerHTML = '64px <span class="testing-note">(only for testing)</span>';
      }
      
      // Hide resolution buttons larger than 512px for text-to-image
      resolutionButtons.forEach(btn => {
        const resolution = btn.getAttribute('data-resolution');
        if (['128', '256', '1024', '1536', '4MP', '8MP', '12MP'].includes(resolution || '')) {
          (btn as HTMLElement).style.display = 'none';
        } else {
          (btn as HTMLElement).style.display = 'block';
        }
      });
      
      // If current resolution is not 64 or 512, switch to 512
      if (!['64', '512'].includes(currentResolution)) {
        currentResolution = '512';
        resolutionButtons.forEach(b => b.classList.remove('active'));
        const res512Btn = document.querySelector('[data-resolution="512"]');
        if (res512Btn) res512Btn.classList.add('active');
      }
    } else {
      patternSection.classList.remove('hidden');
      textToImageSection.classList.add('hidden');
      colorSection.classList.remove('hidden'); // Show color mode for patterns
      
      // Remove testing note from 64px button
      if (res64Btn) {
        res64Btn.innerHTML = '64px';
      }
      
      // Show all resolution buttons for pattern mode
      resolutionButtons.forEach(btn => {
        (btn as HTMLElement).style.display = 'block';
      });
    }
  });
});

// Text-to-image slider updates
stepsSlider.addEventListener('input', () => {
  stepsValue.textContent = stepsSlider.value;
});

guidanceSlider.addEventListener('input', () => {
  guidanceValue.textContent = guidanceSlider.value;
});

// Scheduler selector with recommended steps
schedulerSelect.addEventListener('change', () => {
  let recommendedSteps: number;
  
  recommendedSteps = 20;
  
  stepsSlider.value = recommendedSteps.toString();
  stepsValue.textContent = recommendedSteps.toString();
});

// Load models button
loadModelsBtn.addEventListener('click', async () => {
  if (loadModelsBtn.disabled) return;
  
  loadModelsBtn.disabled = true;
  const originalText = loadModelsBtn.querySelector('.btn-text')?.textContent || 'Load AI Models';
  const btnText = loadModelsBtn.querySelector('.btn-text');
  
  try {
    updateModelStatus('loading', 'Loading models...');
    if (btnText) btnText.textContent = 'Loading...';
    
    await imageGenerator.initializeTextToImage((stage, progress) => {
      updateModelStatus('loading', `${stage} (${Math.round(progress * 100)}%)`);
    });
    
    updateModelStatus('ready', 'Models loaded and ready');
    if (btnText) btnText.textContent = 'Models Loaded ✓';
    loadModelsBtn.style.display = 'none'; // Hide the button once loaded
    
  } catch (error) {
    console.error('Failed to load models:', error);
    updateModelStatus('error', 'Failed to load models');
    if (btnText) btnText.textContent = originalText;
    loadModelsBtn.disabled = false;
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
  canvasOverlay.classList.remove('hidden');
  
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
      
      // Force supported resolution for text-to-image (should already be valid due to UI restrictions)
      if (!['64', '512'].includes(currentResolution)) {
        currentResolution = '512';
      }
      
      const options = {
        negativePrompt: negativePromptInput.value.trim(),
        resolutionKey: currentResolution,
        steps: parseInt(stepsSlider.value),
        guidance: parseFloat(guidanceSlider.value),
        scheduler: schedulerSelect.value as SchedulerType,
        seed: seedInput.value ? parseInt(seedInput.value) : undefined
      };
      
      await imageGenerator.generateFromText(
        canvas, 
        prompt, 
        options,
        (stage, progress) => {
          if (loadingText) loadingText.textContent = `${stage} (${Math.round(progress * 100)}%)`;
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
    canvasOverlay.classList.add('hidden');
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
