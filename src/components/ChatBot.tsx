import { useEffect, useRef, useState } from "react";
import { init, streamingResponse, messages, availableModels, unload, resetChat, interruptEngine, progress as progress } from "../utils/llmUtils";
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
    <div className="h-full bg-transparent flex flex-col">
      <div className="h-full flex flex-col">
        <div className="flex-1 flex flex-col bg-transparent rounded-none overflow-hidden" ref={containerRef}>
          <div className="p-4 bg-black/20 backdrop-blur-[10px] border-b border-white/10 flex flex-col gap-3">
            <div className="flex items-center gap-2 flex-wrap">
              <select
                value={selectedModelIndex}
                onChange={e => setSelectedModelIndex(Number(e.target.value))}
                disabled={initializingModel}
                className="px-3 py-2 bg-white/10 border border-white/20 rounded-lg text-white/90 text-sm cursor-pointer transition-all min-w-[120px] hover:bg-white/15 hover:border-white/30 focus:outline-none focus:border-purple-500 focus:shadow-[0_0_0_2px_rgba(139,92,246,0.2)]"
              >
                {availableModels.map((m, i) => (
                  <option key={i} value={i} className="bg-gray-800 text-white/90">
                    {m.name} ({m.size})
                  </option>
                ))}
              </select>
              <button
                onClick={() => handleInitModel(selectedModelIndex)}
                disabled={initializingModel || initialized}
                className="px-4 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center gap-1.5 bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                Load Model
              </button>
              <button
                onClick={() => { unload(); setInitialized(false); }}
                disabled={!initialized || initializingModel || loading}
                className="px-4 py-2 border-none rounded-lg text-sm font-semibold cursor-pointer transition-all flex items-center gap-1.5 bg-gradient-to-r from-red-500 to-red-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
              >
                Unload Model
              </button>
            </div>
          </div>

          <div className="flex-1 p-4 overflow-y-auto bg-transparent flex flex-col gap-3 scrollbar-thin scrollbar-thumb-white/20 scrollbar-track-transparent">
            {chatMessages.map((msg, i) => (
              <div
                key={i}
                className={`p-3 px-4 rounded-xl max-w-[85%] break-words leading-relaxed text-sm animate-in slide-in-from-bottom-2 duration-300 relative ${
                  msg.role === 'user'
                    ? 'bg-gradient-to-br from-purple-500 to-purple-700 text-white self-end ml-auto shadow-lg shadow-purple-500/30'
                    : msg.role === 'assistant'
                    ? 'bg-white/5 text-white/90 self-start border border-white/10 backdrop-blur-[10px]'
                    : 'bg-amber-500/10 text-amber-400 self-center text-center border border-amber-400/20 text-xs font-medium'
                }`}
                dangerouslySetInnerHTML={{ __html: msg.content }}
              >
              </div>
            ))}
            <div ref={chatEndRef}></div>
          </div>

          <div className="flex gap-2 p-4 bg-black/20 backdrop-blur-[10px] border-t border-white/10">
            <input
              type="text"
              placeholder="Type your message..."
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => { if (e.key === "Enter") handleSend(); }}
              disabled={!initialized || loading || initializingModel}
              className="flex-1 px-4 py-3 bg-white/5 border-2 border-white/10 rounded-xl text-white/90 text-sm outline-none transition-all focus:border-purple-500 focus:bg-white/8 focus:shadow-[0_0_0_3px_rgba(139,92,246,0.1)] placeholder:text-white/50"
            />
            <button
              onClick={loading ? handleInterrupt : handleSend}
              disabled={!initialized || initializingModel}
              title={loading ? "Interrupt generation" : "Send message"}
              className={`px-5 py-3 border-none rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center gap-1.5 min-w-[80px] justify-center hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0 ${
                loading
                  ? 'bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-red-500/30'
                  : 'bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:shadow-emerald-500/30'
              }`}
            >
              {loading ? "⏹️" : "➤"}
            </button>
            <button
              onClick={handleClear}
              disabled={initializingModel || loading}
              className="px-5 py-3 border-none rounded-xl text-sm font-semibold cursor-pointer transition-all flex items-center gap-1.5 min-w-[80px] justify-center bg-gradient-to-r from-red-500 to-red-600 text-white hover:-translate-y-0.5 hover:shadow-lg hover:shadow-red-500/30 disabled:opacity-60 disabled:cursor-not-allowed disabled:translate-y-0"
            >
              Clear
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
