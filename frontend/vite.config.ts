import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
  server: {
    // /api/* 요청을 백엔드(3001)로 프록시 → 브라우저 CORS 우회
    proxy: {
      '/api': 'http://localhost:3001',
    },
  },
})
