import { useEffect, useRef, useState } from "react";
import { init, streamingResponse, messages, availableModels, unload, resetChat, interruptEngine, progress as progress } from "../utils/llmUtils";
import "../styles/ChatApp.css"
import DOMPurify from 'isomorphic-dompurify';
import { marked } from "marked";

export default function ChatBot({ parentWindowRef }: { parentWindowRef: React.RefObject<HTMLDivElement | null> }) {
  const [chatMessages, setChatMessages] = useState<{ role: string; content: string; temp?: boolean }[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialized, setInitialized] = useState(false);
  const [selectedModelIndex, setSelectedModelIndex] = useState<number>(0);
  const [initializingModel, setInitializingModel] = useState(false);

  const chatEndRef = useRef<HTMLDivElement | null>(null);
  const containerRef = useRef<HTMLDivElement | null>(null);

  // Scroll to bottom whenever chatMessages change
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages]);

  useEffect(() => {

    if (parentWindowRef?.current) {
      const resizeObserver = new ResizeObserver(() => {
        // Handle resize
        if (containerRef.current && parentWindowRef.current) {
          containerRef.current.style.height = `${parentWindowRef.current.clientHeight - 42}px`;
          containerRef.current.style.width = `${parentWindowRef.current.clientWidth}px`;
        }

      });
      if (containerRef.current) {
        resizeObserver.observe(parentWindowRef.current!);
      }
      return () => {
        resizeObserver.disconnect();
      };
    }

  }, [parentWindowRef?.current]);


  const handleSend = async () => {
    if (!input.trim() || !initialized) return;

    const userMessage = { role: "user", content: input };
    setChatMessages(prev => [...prev, userMessage]);
    messages.push(userMessage);
    setInput("");
    setLoading(true);

    try {
      let reply = "";
      const chunks = await streamingResponse(messages);

      for await (const chunk of chunks) {
        reply += chunk.choices[0]?.delta.content || "";

        const sanitizedReply = await marked.parse(DOMPurify.sanitize(reply));
        setChatMessages(prev => [
          ...prev.filter(msg => msg.role !== "assistant" || !msg.temp),
          { role: "assistant", content: sanitizedReply, temp: true } as any
        ]);
      }

      const sanitizedReply = await marked.parse(DOMPurify.sanitize(reply));
      // Final assistant message
      setChatMessages(prev => [
        ...prev.filter(msg => msg.role !== "assistant" || !msg.temp),
        { role: "assistant", content: sanitizedReply }
      ]);
      messages.push({ role: "assistant", content: sanitizedReply });
    } catch (e) {
      setChatMessages(prev => [...prev, { role: "assistant", content: "Error: " + e }]);
    } finally {
      setLoading(false);
    }
  };

  const handleInitModel = async (index: number) => {
    setInitializingModel(true);

    const success = init(index);

    // wait and update the user with progress while initializing
    const checkProgress = setInterval(() => {
      setChatMessages([{ role: "system", content: progress.text }]);
    }, 100);

    success.then(() => {
      clearInterval(checkProgress);
      setInitialized(true);
      setSelectedModelIndex(index);
      setChatMessages([{ role: "system", content: `Model loaded: ${availableModels[index].name}` }]);
      setInitializingModel(false);
    });
  };

  const handleInterrupt = async () => {
    interruptEngine();
    setLoading(false);
    setChatMessages(prev => [...prev, { role: "system", content: "Generation interrupted." }]);
  };

  const handleClear = async () => {
    resetChat();
    setChatMessages([]);
    setInput("");
  };



  return (
    <div className="chat-page">
      <div className="chat-parent">
        <div className="chat-container" ref={containerRef}>
          <div className="chat-header">
            <div className="select-model">
              <select value={selectedModelIndex} onChange={e => setSelectedModelIndex(Number(e.target.value))} disabled={initializingModel}>
                {availableModels.map((m, i) => (
                  <option key={i} value={i}>
                    {m.name} ({m.size})
                  </option>
                ))}
              </select>
              <button onClick={() => handleInitModel(selectedModelIndex)} disabled={initializingModel || initialized}>
                Load Model
              </button>
              <button onClick={() => { unload(); setInitialized(false); }} disabled={!initialized || initializingModel || loading} className="unloadbtn">
                Unload Model
              </button>
            </div>
          </div>

          <div className="chat-body">
            {chatMessages.map((msg, i) => (
              <div key={i} className={`chat-message ${msg.role}`} dangerouslySetInnerHTML={{ __html: msg.content }}>
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <div className="chat-input">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              disabled={!initialized || loading || initializingModel}
            />
            <button onClick={handleSend} disabled={!initialized || loading || initializingModel}>
              Send
            </button>
            <button onClick={handleInterrupt} disabled={!loading}>
              Interrupt
            </button>
            <button onClick={handleClear} disabled={initializingModel || loading}>
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
