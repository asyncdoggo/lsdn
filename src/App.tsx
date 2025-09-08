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
    <div className="h-screen">
      <TextToImagePage />
      <div
        className="fixed bottom-5 right-5 w-[420px] h-[400px] min-w-[420px] border border-white/10 rounded-xl shadow-2xl bg-black/95 backdrop-blur-xl z-[1000] resize overflow-hidden animate-in slide-in-from-bottom-5"
        ref={parentWindowRef}
        style={{ display: isClosed ? 'none' : 'block' }}
      >
        <div
          className="flex items-center justify-between p-4 border-b border-white/10 bg-black/20 backdrop-blur-[10px] cursor-move user-select-none"
          ref={floatingWindowHeaderRef}
        >
          <div className="flex items-center gap-2 font-semibold text-white/90 text-sm">
            <div className="text-lg opacity-80">💬</div>
            <span>AI Assistant</span>
          </div>
          <div className="flex gap-1">
            <button
              onClick={handleMinimize}
              className="w-6 h-6 border-none rounded bg-white/10 text-white/70 cursor-pointer transition-all hover:bg-amber-500/20 hover:text-amber-400"
              title="Minimize"
            >
              -
            </button>
            <button
              className="w-6 h-6 border-none rounded bg-white/10 text-white/70 cursor-pointer transition-all hover:bg-red-500/20 hover:text-red-400"
              title="Close"
              onClick={() => {
                const windowElement = parentWindowRef.current;
                const circleElement = floatingCircleRef.current;
                if (windowElement && circleElement) {
                  circleElement.style.left = `${windowElement.offsetLeft}px`;
                  circleElement.style.top = `${windowElement.offsetTop}px`;
                }
                setIsClosed(true);
              }}
            >
              x
            </button>
          </div>
        </div>
        <div className="h-[calc(100%-57px)] overflow-hidden">
          <ChatBot parentWindowRef={parentWindowRef} />
        </div>
      </div>
      <div
        className="fixed w-12 h-12 rounded-full bg-blue-600 text-white flex items-center justify-center cursor-move z-[1000] select-none"
        ref={floatingCircleRef}
        style={{
          display: isClosed ? 'flex' : 'none',
          left: '10px',
          top: '10px'
        }}
      >
        <span className="text-xl">💬</span>
      </div>
    </div>
  );
}

export default App
