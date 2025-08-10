import './style.css'
import { ImageGenerator, type PatternType, type ResolutionKey } from './imageGenerator'

document.querySelector<HTMLDivElement>('#app')!.innerHTML = `
  <div class="app-container">
    <header class="app-header">
      <h1>Random Image Generator</h1>
      <p class="app-subtitle">AI-powered abstract art in B&W and Color</p>
    </header>
    
    <div class="main-content">
      <div class="controls-panel">
        <div class="resolution-section">
          <h3>Resolution</h3>
          <div class="resolution-buttons">
            <button class="resolution-btn" data-resolution="64">64px</button>
            <button class="resolution-btn" data-resolution="128">128px</button>
            <button class="resolution-btn" data-resolution="256">256px</button>
            <button class="resolution-btn" data-resolution="512">512px</button>
            <button class="resolution-btn" data-resolution="1024">1024px</button>
            <button class="resolution-btn active" data-resolution="1536">1536px</button>
            <button class="resolution-btn" data-resolution="4MP">4MP</button>
            <button class="resolution-btn" data-resolution="8MP">8MP</button>
            <button class="resolution-btn" data-resolution="12MP">12MP</button>
          </div>
        </div>

        <div class="color-section">
          <h3>Color Mode</h3>
          <div class="color-toggle">
            <button class="color-btn active" data-color="false">
              <span class="color-icon">⚫</span>
              <span>B&W</span>
            </button>
            <button class="color-btn" data-color="true">
              <span class="color-icon">🌈</span>
              <span>Color</span>
            </button>
          </div>
        </div>

        <div class="generation-mode-section">
          <h3>Generation Mode</h3>
          <div class="mode-toggle">
            <button class="mode-btn active" data-mode="pattern">
              <span class="mode-icon">🎨</span>
              <span>Pattern</span>
            </button>
            <button class="mode-btn" data-mode="text">
              <span class="mode-icon">✍️</span>
              <span>Text-to-Image</span>
            </button>
          </div>
        </div>

        <div class="text-to-image-section hidden">
          <h3>Text Prompt</h3>
          <div class="prompt-controls">
            <textarea 
              id="promptInput" 
              placeholder="Enter your text prompt here... (e.g., 'a beautiful sunset over mountains')"
              rows="3"
              maxlength="500"
            ></textarea>
            <textarea 
              id="negativePromptInput" 
              placeholder="Negative prompt (optional) - what you DON'T want..."
              rows="2"
              maxlength="300"
            ></textarea>
            <div class="ai-settings">
              <div class="setting-group">
                <label for="stepsSlider">Steps: <span id="stepsValue">20</span></label>
                <input type="range" id="stepsSlider" min="10" max="50" value="20" />
              </div>
              <div class="setting-group">
                <label for="guidanceSlider">Guidance: <span id="guidanceValue">7.5</span></label>
                <input type="range" id="guidanceSlider" min="1" max="20" step="0.5" value="7.5" />
              </div>
              <div class="setting-group">
                <label for="seedInput">Seed (optional):</label>
                <input type="number" id="seedInput" placeholder="Random" min="0" max="999999" />
              </div>
            </div>
            <div class="model-status">
              <div class="status-indicator" id="modelStatus">
                <span class="status-dot"></span>
                <span class="status-text">Models not loaded</span>
              </div>
              <button id="loadModelsBtn" class="load-models-btn">
                <span class="btn-icon">📥</span>
                <span class="btn-text">Load AI Models</span>
              </button>
            </div>
          </div>
        </div>

        <div class="pattern-section">
          <h3>Pattern Category</h3>
          <div class="category-tabs">
            <button class="category-tab active" data-category="basic">
              <span class="tab-icon">🎯</span>
              <span>Basic</span>
            </button>
            <button class="category-tab" data-category="geometric">
              <span class="tab-icon">📐</span>
              <span>Geo</span>
            </button>
            <button class="category-tab" data-category="natural">
              <span class="tab-icon">🌿</span>
              <span>Natural</span>
            </button>
            <button class="category-tab" data-category="structural">
              <span class="tab-icon">🏗️</span>
              <span>Struct</span>
            </button>
            <button class="category-tab" data-category="texture">
              <span class="tab-icon">🎨</span>
              <span>Texture</span>
            </button>
            <button class="category-tab" data-category="abstract">
              <span class="tab-icon">🎭</span>
              <span>Abstract</span>
            </button>
            <button class="category-tab" data-category="cosmic">
              <span class="tab-icon">🌌</span>
              <span>Cosmic</span>
            </button>
            <button class="category-tab" data-category="architectural">
              <span class="tab-icon">🏛️</span>
              <span>Arch</span>
            </button>
            <button class="category-tab" data-category="glitch">
              <span class="tab-icon">📱</span>
              <span>Glitch</span>
            </button>
          </div>

          <div class="pattern-grid">
            <!-- Basic Patterns -->
            <div class="pattern-category" data-category="basic">
              <button class="pattern-card active" data-pattern="noise">
                <div class="pattern-preview">⚪</div>
                <div class="pattern-info">
                  <h4>Pure Noise</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="perlin">
                <div class="pattern-preview">☁️</div>
                <div class="pattern-info">
                  <h4>Perlin Noise</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="wave">
                <div class="pattern-preview">〰️</div>
                <div class="pattern-info">
                  <h4>Wave</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="static">
                <div class="pattern-preview">📺</div>
                <div class="pattern-info">
                  <h4>TV Static</h4>
                </div>
              </button>
            </div>

            <!-- Geometric Patterns -->
            <div class="pattern-category hidden" data-category="geometric">
              <button class="pattern-card" data-pattern="cellular">
                <div class="pattern-preview">🕳️</div>
                <div class="pattern-info">
                  <h4>Cellular</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="fractal">
                <div class="pattern-preview">🌀</div>
                <div class="pattern-info">
                  <h4>Fractal</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="voronoi">
                <div class="pattern-preview">⬡</div>
                <div class="pattern-info">
                  <h4>Voronoi</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="spiral">
                <div class="pattern-preview">🌪️</div>
                <div class="pattern-info">
                  <h4>Spiral</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="honeycomb">
                <div class="pattern-preview">🍯</div>
                <div class="pattern-info">
                  <h4>Honeycomb</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="crystals">
                <div class="pattern-preview">💎</div>
                <div class="pattern-info">
                  <h4>Crystals</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="mandala">
                <div class="pattern-preview">🕉️</div>
                <div class="pattern-info">
                  <h4>Mandala</h4>
                </div>
              </button>
            </div>

            <!-- Natural Patterns -->
            <div class="pattern-category hidden" data-category="natural">
              <button class="pattern-card" data-pattern="lightning">
                <div class="pattern-preview">⚡</div>
                <div class="pattern-info">
                  <h4>Lightning</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="cloud">
                <div class="pattern-preview">☁️</div>
                <div class="pattern-info">
                  <h4>Clouds</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="terrain">
                <div class="pattern-preview">🏔️</div>
                <div class="pattern-info">
                  <h4>Terrain</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="organic">
                <div class="pattern-preview">🌱</div>
                <div class="pattern-info">
                  <h4>Organic</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="faces">
                <div class="pattern-preview">👤</div>
                <div class="pattern-info">
                  <h4>Faces</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="bodies">
                <div class="pattern-preview">🚶</div>
                <div class="pattern-info">
                  <h4>Bodies</h4>
                </div>
              </button>
            </div>

            <!-- Structural Patterns -->
            <div class="pattern-category hidden" data-category="structural">
              <button class="pattern-card" data-pattern="maze">
                <div class="pattern-preview">🌀</div>
                <div class="pattern-info">
                  <h4>Maze</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="circuit">
                <div class="pattern-preview">💻</div>
                <div class="pattern-info">
                  <h4>Circuit</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="neural">
                <div class="pattern-preview">🧠</div>
                <div class="pattern-info">
                  <h4>Neural</h4>
                </div>
              </button>
            </div>

            <!-- Texture Patterns -->
            <div class="pattern-category hidden" data-category="texture">
              <button class="pattern-card" data-pattern="marble">
                <div class="pattern-preview">🪨</div>
                <div class="pattern-info">
                  <h4>Marble</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="wood">
                <div class="pattern-preview">🪵</div>
                <div class="pattern-info">
                  <h4>Wood</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="lace">
                <div class="pattern-preview">🧶</div>
                <div class="pattern-info">
                  <h4>Lace</h4>
                </div>
              </button>
            </div>

            <!-- Abstract Patterns -->
            <div class="pattern-category hidden" data-category="abstract">
              <button class="pattern-card" data-pattern="ink">
                <div class="pattern-preview">🖋️</div>
                <div class="pattern-info">
                  <h4>Ink Blot</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="splash">
                <div class="pattern-preview">💧</div>
                <div class="pattern-info">
                  <h4>Paint Splash</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="flow">
                <div class="pattern-preview">💫</div>
                <div class="pattern-info">
                  <h4>Flow Field</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="abstract">
                <div class="pattern-preview">🎨</div>
                <div class="pattern-info">
                  <h4>Abstract Art</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="kaleidoscope">
                <div class="pattern-preview">🔮</div>
                <div class="pattern-info">
                  <h4>Kaleidoscope</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="morphing">
                <div class="pattern-preview">🌊</div>
                <div class="pattern-info">
                  <h4>Morphing</h4>
                </div>
              </button>
            </div>

            <!-- Cosmic Patterns -->
            <div class="pattern-category hidden" data-category="cosmic">
              <button class="pattern-card" data-pattern="galaxy">
                <div class="pattern-preview">🌌</div>
                <div class="pattern-info">
                  <h4>Galaxy</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="nebula">
                <div class="pattern-preview">☄️</div>
                <div class="pattern-info">
                  <h4>Nebula</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="stars">
                <div class="pattern-preview">⭐</div>
                <div class="pattern-info">
                  <h4>Starfield</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="blackhole">
                <div class="pattern-preview">🕳️</div>
                <div class="pattern-info">
                  <h4>Black Hole</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="planets">
                <div class="pattern-preview">🪐</div>
                <div class="pattern-info">
                  <h4>Planets</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="wormhole">
                <div class="pattern-preview">🌀</div>
                <div class="pattern-info">
                  <h4>Wormhole</h4>
                </div>
              </button>
            </div>

            <!-- Architectural Patterns -->
            <div class="pattern-category hidden" data-category="architectural">
              <button class="pattern-card" data-pattern="gothic">
                <div class="pattern-preview">⛪</div>
                <div class="pattern-info">
                  <h4>Gothic</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="modern">
                <div class="pattern-preview">🏢</div>
                <div class="pattern-info">
                  <h4>Modern</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="blueprint">
                <div class="pattern-preview">📐</div>
                <div class="pattern-info">
                  <h4>Blueprint</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="columns">
                <div class="pattern-preview">🏛️</div>
                <div class="pattern-info">
                  <h4>Columns</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="bridges">
                <div class="pattern-preview">🌉</div>
                <div class="pattern-info">
                  <h4>Bridges</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="cityscape">
                <div class="pattern-preview">🏙️</div>
                <div class="pattern-info">
                  <h4>Cityscape</h4>
                </div>
              </button>
            </div>

            <!-- Glitch Patterns -->
            <div class="pattern-category hidden" data-category="glitch">
              <button class="pattern-card" data-pattern="datamosh">
                <div class="pattern-preview">📱</div>
                <div class="pattern-info">
                  <h4>Datamosh</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="scan">
                <div class="pattern-preview">📺</div>
                <div class="pattern-info">
                  <h4>Scan Lines</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="corrupt">
                <div class="pattern-preview">💾</div>
                <div class="pattern-info">
                  <h4>Corrupt Data</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="digital">
                <div class="pattern-preview">🔢</div>
                <div class="pattern-info">
                  <h4>Digital Rain</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="pixel">
                <div class="pattern-preview">🎮</div>
                <div class="pattern-info">
                  <h4>Pixel Sort</h4>
                </div>
              </button>
              <button class="pattern-card" data-pattern="static_interference">
                <div class="pattern-preview">📻</div>
                <div class="pattern-info">
                  <h4>Interference</h4>
                </div>
              </button>
            </div>
          </div>
        </div>

        <div class="action-section">
          <button id="generate" class="generate-btn" type="button">
            <span class="btn-icon">✨</span>
            <span class="btn-text">Generate</span>
          </button>
          <button id="download" class="download-btn" type="button" disabled>
            <span class="btn-icon">💾</span>
            <span class="btn-text">Download</span>
          </button>
        </div>
      </div>

      <div class="canvas-panel">
        <div class="canvas-container">
          <canvas id="imageCanvas"></canvas>
          <div class="canvas-overlay hidden">
            <div class="loading-spinner"></div>
            <p class="loading-text">Generating...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`

const imageGenerator = new ImageGenerator()

// State management
let currentResolution: ResolutionKey = '1536';
let currentPattern: PatternType = 'noise';
let isColorMode: boolean = false;
let generationMode: 'pattern' | 'text' = 'pattern';

// Get elements
const canvas = document.querySelector<HTMLCanvasElement>('#imageCanvas')!
const generateBtn = document.querySelector<HTMLButtonElement>('#generate')!
const downloadBtn = document.querySelector<HTMLButtonElement>('#download')!
const canvasOverlay = document.querySelector('.canvas-overlay') as HTMLDivElement;
const loadingText = document.querySelector('.loading-text') as HTMLParagraphElement;

// Text-to-image elements
const promptInput = document.querySelector<HTMLTextAreaElement>('#promptInput')!;
const negativePromptInput = document.querySelector<HTMLTextAreaElement>('#negativePromptInput')!;
const stepsSlider = document.querySelector<HTMLInputElement>('#stepsSlider')!;
const guidanceSlider = document.querySelector<HTMLInputElement>('#guidanceSlider')!;
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

modeButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    modeButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    generationMode = btn.getAttribute('data-mode') as 'pattern' | 'text';
    
    // Toggle UI sections
    if (generationMode === 'text') {
      patternSection.classList.add('hidden');
      textToImageSection.classList.remove('hidden');
      // For text-to-image, limit to smaller resolutions (up to 512x512)
      // If current resolution is too large, switch to 512
      if (!['64', '128', '256', '512'].includes(currentResolution)) {
        currentResolution = '512';
        resolutionButtons.forEach(b => b.classList.remove('active'));
        const res512Btn = document.querySelector('[data-resolution="512"]');
        if (res512Btn) res512Btn.classList.add('active');
      }
    } else {
      patternSection.classList.remove('hidden');
      textToImageSection.classList.add('hidden');
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
      
      // Force supported resolution for text-to-image
      if (!['64', '128', '256', '512'].includes(currentResolution)) {
        currentResolution = '512';
        resolutionButtons.forEach(b => b.classList.remove('active'));
        const res512Btn = document.querySelector('[data-resolution="512"]');
        if (res512Btn) res512Btn.classList.add('active');
      }
      
      const options = {
        negativePrompt: negativePromptInput.value.trim(),
        resolutionKey: currentResolution,
        steps: parseInt(stepsSlider.value),
        guidance: parseFloat(guidanceSlider.value),
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
    canvasOverlay.classList.add('hidden');
    if (btnText) btnText.textContent = originalText;
    if (loadingText) loadingText.textContent = 'Generating...';
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
