import './App.css'
import "./styles/base.css"
import "./styles/controls.css"
import "./styles/layout.css"
import "./styles/responsive.css"
import Header from './components/Header'
import ResolutionSection from './components/ResolutionSection'
import TextToImageSection from './components/textToImageSection'
import ActionSection from './components/ActionSection'
import CanvasSection from './components/CanvasSection'
import { TextToImageGenerator } from './textToImageGenerator'
import { useRef, useState } from 'react'


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

function App() {
  const [settings, setSettings] = useState(initialSettings);
  const [_, setBaseUrl] = useState(initialBaseUrl);
  const [loadingText, setLoadingText] = useState<string | undefined>(undefined);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const ttoiRef = useRef<TextToImageGenerator | null>(new TextToImageGenerator());

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

          <CanvasSection canvasRef={canvasRef} loadingText={loadingText} />
        </div>
      </div>
    </>
  )
}

export default App
