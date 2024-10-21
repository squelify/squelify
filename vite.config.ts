import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  appType: 'spa',
  build: {
    manifest: true,
    outDir: './dist',
    rollupOptions: {
      input: './client/main.tsx',
    },
  },
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
})
