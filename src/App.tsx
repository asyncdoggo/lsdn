import ChatBot from './components/ChatBot';
import ResizableWindow from './components/ResizableWindow';
import TextToImagePage from './pages/TextToImage'


function App() {

return (
    <div style={{ height: "100vh" }}>
      <ResizableWindow
        left={<TextToImagePage />}
        right={<ChatBot />}
      />
    </div>
  );
}

export default App
