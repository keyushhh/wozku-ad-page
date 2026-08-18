import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  // relative base so the built output also works from file://
  base: './',
  plugins: [react(), tailwindcss()],
})
