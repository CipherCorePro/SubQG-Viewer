import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000, // Frontend port
    open: true,
    proxy: {
      // Proxy /api requests to our Express server
      '/api': {
        target: 'http://localhost:3001', // Backend server runs on port 3001
        changeOrigin: true,
        // rewrite: (path) => path.replace(/^\/api/, '') // Only if your backend routes don't start with /api
      }
    }
  }
})
