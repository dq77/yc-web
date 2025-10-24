import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url))
    },
  },
  server: {
    proxy: {
      '/api': {
        target: 'https://hzycai.com',
        // target: 'http://localhost:4001',
        changeOrigin: true
      },
      '/lkapi': {
        target: 'https://hzycai.com',
        changeOrigin: true
      }
    }
  }
})
