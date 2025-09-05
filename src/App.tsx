import ChatBot from './components/ChatBot';
import TextToImagePage from './pages/TextToImage'
import { useEffect, useRef, useState } from 'react';

function App() {

  const [isClosed, setIsClosed] = useState(false);
  const floatingWindowHeaderRef = useRef<HTMLDivElement>(null);
  const parentWindowRef = useRef<HTMLDivElement>(null);
  const floatingCircleRef = useRef<HTMLDivElement>(null);

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

    floatingCircleRef.current?.addEventListener('mousedown', (e) => {
      const circleElement = floatingCircleRef.current!
      const x = e.clientX - circleElement.getBoundingClientRect().left
      const y = e.clientY - circleElement.getBoundingClientRect().top
      let isDragging = false;

      function mouseMoveHandler(e: MouseEvent) {
        isDragging = true;
        circleElement.style.left = `${e.clientX - x}px`
        circleElement.style.top = `${e.clientY - y}px`
        // Do not allow circleElement to be dragged outside of the screen
        if (circleElement.offsetLeft < 0) {
          circleElement.style.left = '0px'
        }
        if (circleElement.offsetTop < 0) {
          circleElement.style.top = '0px'
        }
        if (circleElement.offsetLeft + circleElement.offsetWidth > window.innerWidth) {
          circleElement.style.left = `${window.innerWidth - circleElement.offsetWidth}px`
        }
        if (circleElement.offsetTop + circleElement.offsetHeight > window.innerHeight) {
          circleElement.style.top = `${window.innerHeight - circleElement.offsetHeight}px`
        }
      }

      document.addEventListener('mousemove', mouseMoveHandler);

      document.addEventListener('mouseup', () => {
        document.removeEventListener('mousemove', mouseMoveHandler);
        if (!isDragging) {
          // it was a click, restore window
          const windowElement = parentWindowRef.current;
          const circleElement = floatingCircleRef.current;
          if (windowElement && circleElement) {
            windowElement.style.left = `${circleElement.offsetLeft}px`;
            windowElement.style.top = `${circleElement.offsetTop}px`;
          }
          setIsClosed(false);
        }
      }, { once: true });
    });
  }, [floatingWindowHeaderRef, floatingCircleRef]);

  const handleMinimize = () => {
    const windowElement = parentWindowRef.current;
    if (windowElement) {
      if (windowElement.style.height === '50px') {
        windowElement.style.height = '400px';
        windowElement.style.width = '420px';
      } else {
        windowElement.style.height = '50px';
        windowElement.style.width = '420px';
      }
    }
  }

  return (
    <div style={{ height: "100vh" }}>
      <TextToImagePage />
      <div className="floating-window" ref={parentWindowRef} style={{ display: isClosed ? 'none' : 'block' }}>
        <div className='floating-header' ref={floatingWindowHeaderRef}>
          <div className="floating-title">
            <div className="floating-icon">💬</div>
            <span>AI Assistant</span>
          </div>
          <div className="floating-controls">
            <button onClick={handleMinimize} className="floating-minimize" title="Minimize">-</button>
            <button className="floating-close" title="Close" onClick={() => { const windowElement = parentWindowRef.current; const circleElement = floatingCircleRef.current; if (windowElement && circleElement) { circleElement.style.left = `${windowElement.offsetLeft}px`; circleElement.style.top = `${windowElement.offsetTop}px`; } setIsClosed(true); }}>x</button>
          </div>
        </div>
        <div className='floating-content'>
          <ChatBot parentWindowRef={parentWindowRef} />
        </div>
      </div>
      <div ref={floatingCircleRef} style={{ display: isClosed ? 'flex' : 'none', position: 'absolute', left: '10px', top: '10px', width: '50px', height: '50px', borderRadius: '50%', backgroundColor: '#007bff', color: 'white', alignItems: 'center', justifyContent: 'center', cursor: 'move', zIndex: 1000 }}>
        <span style={{ fontSize: '20px' }}>💬</span>
      </div>
    </div>
  );
}

export default App
