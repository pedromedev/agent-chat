import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
  server: {
    allowedHosts: ['b2bbfff54f8e.ngrok.app', 'e8ad6cddb694.ngrok-free.app'],
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ''),
      },
    },
  },
  // Configuração para produção
  define: {
    __API_BASE_URL__: JSON.stringify(process.env.NODE_ENV === 'production' 
      ? 'https://e8ad6cddb694.ngrok-free.app' 
      : 'http://localhost:3000'
    ),
  },
})
