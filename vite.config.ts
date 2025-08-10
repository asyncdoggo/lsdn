import { defineConfig } from 'vite'

export default defineConfig({
  // Configure how Vite handles ONNX.js
  optimizeDeps: {
    include: ['onnxruntime-web']
  },
  
  // Configure headers for proper WASM loading from CDN
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  
  // Build configuration
  build: {
    target: 'es2020'
  }
})
