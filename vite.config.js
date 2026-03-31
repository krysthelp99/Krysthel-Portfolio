import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    open: '/react.html',
  },
  build: {
    rollupOptions: {
      input: {
        static: 'index.html',
        react: 'react.html',
      },
    },
  },
})
