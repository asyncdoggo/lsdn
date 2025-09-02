import React, { useEffect, useRef, useState } from "react";
import { init, streamingResponse, messages, availableModels, unload, resetChat, interruptEngine, progress as progress} from "../utils/llmUtils";
import "../styles/ChatApp.css"
import DOMPurify from 'isomorphic-dompurify';
import { marked } from "marked";

export default function ChatBot() {
    const [chatMessages, setChatMessages] = useState<{ role: string; content: string; temp?: boolean }[]>([]);
    const [input, setInput] = useState("");
    const [loading, setLoading] = useState(false);
    const [initialized, setInitialized] = useState(false);
    const [selectedModelIndex, setSelectedModelIndex] = useState<number | null>(null);
    const [initializingModel, setInitializingModel] = useState(false);

    const chatEndRef = useRef<HTMLDivElement | null>(null);

    // Scroll to bottom whenever chatMessages change
    useEffect(() => {
        chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [chatMessages]);

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
          setChatMessages([{role: "system", content: progress.text}]);
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
                <div className="chat-container">
                    <div className="chat-header">
                        <span>Chat</span>
                        {!initialized && (
                            <div className="model-selector">
                                <span>Select model: </span>
                                {availableModels.map((m, i) => (
                                    <button
                                        key={i}
                                        onClick={() => handleInitModel(i)}
                                        disabled={initializingModel}
                                        className={selectedModelIndex === i ? "selected" : ""}
                                    >
                                        {m.name}
                                    </button>
                                ))}
                                {initializingModel && <span className="loading-text">Loading model...</span>}
                            </div>
                        )}
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
