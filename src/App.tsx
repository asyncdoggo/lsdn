import ChatBot from './components/ChatBot';
import TextToImagePage from './pages/TextToImage'
import { useEffect, useRef } from 'react';

function App() {

  const floatingWindowHeaderRef = useRef<HTMLDivElement>(null);
  const parentWindowRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    floatingWindowHeaderRef.current?.addEventListener('mousedown', (e) => {
      const windowElement =  parentWindowRef.current!
      const x = e.clientX - windowElement.getBoundingClientRect().left
      const y = e.clientY - windowElement.getBoundingClientRect().top

        function mouseMoveHandler(e: MouseEvent) {

            windowElement.style.left = `${e.clientX - x}px`
            windowElement.style.top = `${e.clientY - y}px`
            // Do not allow windowElement to be dragged outside of the screen
            if (windowElement.offsetLeft < 0) {
                windowElement.style.left = '0px'
            }
            if (windowElement.offsetTop < 0) {
                windowElement.style.top = '0px'
            }
            if (windowElement.offsetLeft + windowElement.offsetWidth > window.innerWidth) {
                windowElement.style.left = `${window.innerWidth - windowElement.offsetWidth}px`
            }
            if (windowElement.offsetTop + windowElement.offsetHeight > window.innerHeight) {
                windowElement.style.top = `${window.innerHeight - windowElement.offsetHeight}px`
            }

        }

      document.addEventListener('mousemove', mouseMoveHandler);

      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
      }, { once: true });
    });
  }, [floatingWindowHeaderRef]);

  return (
    <div style={{ height: "100vh" }}>
      <TextToImagePage />
      <div className="floating-window" ref={parentWindowRef}>
        <div className='header' ref={floatingWindowHeaderRef} style={{ textAlign: 'center', fontWeight: 'bold', padding: '8px', borderBottom: '1px solid #ccc' }}>ChatBot</div>
        <div className='content'>
          <ChatBot parentWindowRef={parentWindowRef} />
        </div>
      </div>
    </div>
  );
}

export default App
