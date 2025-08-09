import './style.css'
import { ImageGenerator, type PatternType } from './imageGenerator'

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
            <button class="resolution-btn active" data-resolution="4MP">4MP</button>
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
            <p>Generating...</p>
          </div>
        </div>
      </div>
    </div>
  </div>
`

const imageGenerator = new ImageGenerator()

// State management
let currentResolution: '4MP' | '8MP' | '12MP' = '4MP';
let currentPattern: PatternType = 'noise';
let isColorMode: boolean = false;

// Get elements
const canvas = document.querySelector<HTMLCanvasElement>('#imageCanvas')!
const generateBtn = document.querySelector<HTMLButtonElement>('#generate')!
const downloadBtn = document.querySelector<HTMLButtonElement>('#download')!
const canvasOverlay = document.querySelector('.canvas-overlay') as HTMLDivElement;

// Resolution buttons
const resolutionButtons = document.querySelectorAll('.resolution-btn');
resolutionButtons.forEach(btn => {
  btn.addEventListener('click', () => {
    resolutionButtons.forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentResolution = btn.getAttribute('data-resolution') as '4MP' | '8MP' | '12MP';
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
generateBtn.addEventListener('click', () => {
  generateBtn.disabled = true;
  downloadBtn.disabled = true;
  canvasOverlay.classList.remove('hidden');
  
  // Use setTimeout to allow UI to update before heavy computation
  setTimeout(() => {
    try {
      imageGenerator.generatePatternImage(canvas, currentResolution, currentPattern, isColorMode);
      downloadBtn.disabled = false;
    } catch (error) {
      console.error('Error generating image:', error);
      alert('Error generating image. Please try again.');
    } finally {
      generateBtn.disabled = false;
      canvasOverlay.classList.add('hidden');
    }
  }, 100);
});

// Download button
downloadBtn.addEventListener('click', () => {
  imageGenerator.downloadImage(canvas, `random-bw-image-${currentPattern}-${currentResolution}-${Date.now()}.png`);
});

// Initialize with default values on page load
setTimeout(() => {
  generateBtn.click();
}, 500);
