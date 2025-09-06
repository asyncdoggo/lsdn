import './../styles/TextToImage.css'
import "../styles/base.css"
import "../styles/controls.css"
import "../styles/layout.css"
import "../styles/responsive.css"
import Header from '../components/Header'
import ResolutionSection from '../components/ResolutionSection'
import TextToImageSection from '../components/textToImageSection'
import ActionSection from '../components/ActionSection'
import CanvasSection from '../components/CanvasSection'
import { TextToImageGenerator } from '../textToImageGenerator'
import { useEffect, useRef, useState } from 'react'


const initialSettings = {
  prompt: '',
  negativePrompt: '',
  steps: 20,
  guidance: 7.5,
  scheduler: 'euler-karras',
  seed: '',
  useTiledVAE: true,
  randomize: true,
  lowMemoryMode: true,
  width: 512,
  height: 512,
  tileSize: 256,
  model: 'subpixel/small-stable-diffusion-v0-onnx-ort-web',
  previewUrl: ''
};

const initialBaseUrl = 'subpixel/small-stable-diffusion-v0-onnx-ort-web';

function TextToImagePage() {
  const [settings, setSettings] = useState(initialSettings);
  const [_, setBaseUrl] = useState(initialBaseUrl);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ttoiRef = useRef<TextToImageGenerator | null>(new TextToImageGenerator());

  useEffect(() => {
    const handleUnhandledRejection = (event: PromiseRejectionEvent) => {
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
    };

    window.addEventListener('unhandledrejection', handleUnhandledRejection);

    return () => {
      window.removeEventListener('unhandledrejection', handleUnhandledRejection);
    };
  }, []);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl+Enter to generate
      if (event.ctrlKey && event.key === 'Enter') {
        event.preventDefault();
        const generateBtn = document.getElementById('generate') as HTMLButtonElement;
        if (generateBtn && !generateBtn.disabled) {
          generateBtn.click();
        }
      }

      // Ctrl+Shift+C to clear prompts
      if (event.ctrlKey && event.shiftKey && event.key === 'C') {
        event.preventDefault();
        setSettings({
          ...settings,
          prompt: '',
          negativePrompt: ''
        });
      }

      // Escape to stop generation
      if (event.key === 'Escape') {
        const stopBtn = document.getElementById('stop') as HTMLButtonElement;
        if (stopBtn && !stopBtn.disabled) {
          stopBtn.click();
        }
      }

      // Ctrl+S to download (if available)
      if (event.ctrlKey && event.key === 's') {
        event.preventDefault();
        const downloadBtn = document.getElementById('download') as HTMLButtonElement;
        if (downloadBtn && !downloadBtn.disabled) {
          downloadBtn.click();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [settings]);

  return (
    <>
      <div className="app-container">
        <Header />

        <div className="main-content">
          <div className="controls-panel">
            <ResolutionSection settings={settings} setSettings={setSettings} />
            <TextToImageSection settings={settings} setSettings={setSettings} generator={ttoiRef.current} />
            <ActionSection settings={settings} setSettings={setSettings} setBaseUrl={setBaseUrl} generator={ttoiRef.current} setLoadingText={setLoadingText} canvasRef={canvasRef} />
          </div>

          <CanvasSection canvasRef={canvasRef} loadingText={loadingText} settings={settings} />
        </div>
      </div>
    </>
  )
}

export default TextToImagePage
