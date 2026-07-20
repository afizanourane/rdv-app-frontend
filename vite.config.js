


import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Forcer une seule instance de React
      'react':     path.resolve('./node_modules/react'),
      'react-dom': path.resolve('./node_modules/react-dom'),
    },
  },
  server: {
    port: 3000,
    proxy: {
      '/api': {
        target:       'http://127.0.0.1:8000',
        changeOrigin: true,
      }
    }
  }
})
