import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import cssInjectedByJsPlugin from 'vite-plugin-css-injected-by-js'

export default defineConfig({
  plugins: [react(), cssInjectedByJsPlugin()],
  base: '/data-layer-viewer/',
  build: {
    rollupOptions: {
        output: {
            entryFileNames: "bundle.js",
            chunkFileNames: "bundle.js",
            assetFileNames: "styles.css"
        }
    }
  }
})
