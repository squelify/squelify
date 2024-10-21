import react from '@vitejs/plugin-react'
import { defineConfig } from 'vite'

export default defineConfig({
  plugins: [react()],
  server: { port: 5173, strictPort: true },
  appType: 'mpa',
  build: {
    manifest: true,
    outDir: './.client',
    rollupOptions: {
      input: './client/main.tsx',
    },
  },
  optimizeDeps: {
    include: ['react/jsx-runtime'],
  },
})
