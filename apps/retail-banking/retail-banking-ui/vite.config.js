import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/api/accounts': {
        target: 'http://localhost:8091',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/accounts/, '')
      },
      '/api/transactions': {
        target: 'http://localhost:8092',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/transactions/, '')
      },
      '/api/fraud': {
        target: 'http://localhost:8093',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/fraud/, '')
      },
      '/api/logs': {
        target: 'http://localhost:8094',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/logs/, '')
      }
    }
  }
})
