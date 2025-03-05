import fs from 'fs'
import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

// Function to scan the pages directory and create input entries
function getPageInputs() {
  const pagesDir = path.resolve(__dirname, 'pages')
  const inputs = {
    bundle: path.resolve(__dirname, 'index.html'),
  }

  if (fs.existsSync(pagesDir)) {
    const pageFiles = fs.readdirSync(pagesDir)

    // Add each HTML file in the pages directory as an input
    pageFiles.forEach((file) => {
      if (file.endsWith('.html')) {
        // Use the filename without extension as the key
        const name = file.replace('.html', '')
        inputs[name] = path.resolve(pagesDir, file)
      }
    })
  }

  return inputs
}
export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin(
    {
      jsAssetsFilterFunction: function customJsAssetsfilterFunction(outputChunk) {
        return outputChunk.fileName === 'main.js'
      },
    },
  )],
  base: '/data-layer-viewer/',
  build: {
    chunkSizeWarningLimit: 1024,
    rollupOptions: {
      input: getPageInputs(),
      output: {
        entryFileNames: '[name].js',
        chunkFileNames: '[name].js',
      },
    },
  },
  resolve: {
    alias: {
      '@/components': path.resolve(__dirname, './src/components'),
      '@/resources': path.resolve(__dirname, './resources'),
      '@/src': path.resolve(__dirname, './src'),
      '@/types': path.resolve(__dirname, './types'),
    },
  },
  preview: {
    historyApiFallback: {
      rewrites: [
        { from: /^\/mobile\.html/, to: '/mobile.html' },
        { from: /^\/.*/, to: '/index.html' },
      ],
    },
  },
})
