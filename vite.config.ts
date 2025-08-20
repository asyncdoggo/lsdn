import { defineConfig } from 'vite'
import { resolve } from 'path'
import { copyFileSync, mkdirSync, readdirSync } from 'fs'

// Copy ONNX Runtime files to the build output
function copyOnnxFiles() {
  const sourceDir = resolve(__dirname, 'node_modules/onnxruntime-web/dist');
  const targetDir = resolve(__dirname, 'dist/onnx');

  try {
    // Create target directory
    mkdirSync(targetDir, { recursive: true });
    
    // Copy all files from onnxruntime-web/dist
    const files = readdirSync(sourceDir);
    for (const file of files) {
      copyFileSync(
        resolve(sourceDir, file),
        resolve(targetDir, file)
      );
    }
    console.log('ONNX Runtime files copied successfully');
  } catch (err) {
    console.error('Error copying ONNX files:', err);
  }
}

export default defineConfig({
  // Configure how Vite handles ONNX.js
  optimizeDeps: {
    include: ['onnxruntime-web']
  },
  
  // Configure headers for proper WASM loading
  server: {
    headers: {
      'Cross-Origin-Embedder-Policy': 'require-corp',
      'Cross-Origin-Opener-Policy': 'same-origin',
    }
  },
  
  // Build configuration
  build: {
    target: 'es2020',
    // Copy ONNX files after build
    rollupOptions: {
      output: {
        chunkFileNames: 'assets/[name]-[hash].js',
        entryFileNames: 'assets/[name]-[hash].js',
        assetFileNames: 'assets/[name]-[hash][extname]'
      }
    }
  },
  plugins: [{
    name: 'copy-onnx-files',
    closeBundle() {
      copyOnnxFiles();
    }
  }]
})
