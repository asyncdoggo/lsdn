import { MLCEngine } from "@mlc-ai/web-llm";


export let progress = {progress: 0, text: "", timeElapsed: 0}

const initProgressCallback = (initProgress: any) => {
    progress = initProgress;    
  }

const engine = new MLCEngine(
{ initProgressCallback: initProgressCallback }, // engineConfig
);

engine.getInitProgressCallback

export const availableModels = [
  {
    name: "Qwen2.5-0.5B-Instruct-q4f16_1-MLC",
    notes: "kinda larger, slower, slightly smart.",
  },
  {
    name: "gemma-2b-it-q4f16_1-MLC",
    notes: "kinda larger. This guy talks using emojis lmao.",
  },
  {
    name: "Llama-3.2-1B-Instruct-q4f16_1-MLC",
    notes: "small but smart.",
  },
  {
    name: "TinyLlama-1.1B-Chat-v0.4-q4f16_1-MLC",
    notes: "larger, slower, smart enough.",
  },
  {
    name: "stablelm-2-zephyr-1_6b-q4f32_1-MLC-1k",
    notes: "This guy is smart, kinda large and uncensored, be careful.",
  }
]

export async function init(index: number) {    
    progress = {progress: 0, text: "", timeElapsed: 0}
    engine.resetChat();
    engine.unload();

    try {
      const selectedModel = availableModels[index];      
      if (!selectedModel) {
        return false;
      }
      await engine.reload(selectedModel.name).then(() => {
        console.log("Model loaded successfully!");
      })
      .catch((e: Error) => {
        console.log(e);
        progress = {progress: -1, text: "Failed to load model", timeElapsed: 0}
        engine.unload();
      });
      return true;   
    }
    catch (e) {
      console.log(e);
      return false;
    }
}

export async function completion(message: any){    
    const reply = await engine.chat.completions.create({
        messages: message,
    });
    return reply.choices[0].message.content;
}

export const messages = [
    { 
        role: "system", 
        content: "You are a helpful AI assistant." 
    },
]

export const interruptEngine = async () => {await engine.interruptGenerate()}
export const resetChat = () => {
    messages.length = 0;
    messages.push({ role: "system", content: "You are a helpful AI assistant." });
    engine.resetChat();
}
export const unload = async () => {await engine.unload()}

export const streamingResponse = async function (messages: any) {
    const chunks = await engine.chat.completions.create({
        messages,
        temperature: 1,
        stream: true, // <-- Enable streaming
        stream_options: { include_usage: true },
      });
      return chunks;
}

