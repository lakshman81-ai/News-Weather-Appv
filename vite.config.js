import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Use relative base path for maximum compatibility on GitHub Pages
  base: './',
  build: {
    outDir: 'docs',
    sourcemap: true,
    rollupOptions: {
      output: {
        manualChunks: {
          'vendor-react': ['react', 'react-dom', 'react-router-dom'],
          'vendor-ui': ['react-icons'],
          'utils-sentiment': ['sentiment', 'string-similarity']
        }
      }
    }
  },
  server: {
    // Proxy config removed for production build compatibility
  }
})
