import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/refeitorios/painel/',
  server: {
    port: 5173,
    host: true,
    watch: {
      // Usa polling em vez de inotify para evitar o erro ENOSPC
      usePolling: true,
      interval: 1000,
    },
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
})
