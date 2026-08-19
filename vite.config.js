import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  // Rutas relativas: así el build funciona igual servido desde la raíz de un
  // dominio que desde un subdirectorio (GitHub Pages, Drive, un aula virtual...).
  base: './',
  server: { port: 5173, open: true },
})
