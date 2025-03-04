import path from 'path'
import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  base: '/data-layer-viewer/',
  build: {
    rollupOptions: {
      output: {
        entryFileNames: 'bundle.js',
        chunkFileNames: 'bundle.js',
        assetFileNames: 'styles.css',
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
})
