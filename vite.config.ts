import react from '@vitejs/plugin-react'
import { visualizer } from 'rollup-plugin-visualizer'
import { isCI, isProduction } from 'std-env'
import { defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  plugins: [
    react(),
    // `emitFile` is necessary since Nitro builds more than one bundle!
    !isCI && visualizer({ emitFile: true, template: 'treemap' }),
    inspect({ build: false, open: false }),
    tsconfigPaths(),
  ],
  appType: 'mpa',
  clearScreen: true,
  envPrefix: ['VITE_'],
  server: { port: 5173, strictPort: true },
  optimizeDeps: {
    /**
     * Excludes the specified packages from the Vite dependency optimization.
     * This can be useful to exclude packages that are not needed in the production build,
     * or to exclude packages that are causing issues during the build process.
     */
    exclude: ['react/jsx-runtime', '@node-rs/argon2'],
  },
  publicDir: './public',
  base: '/',
  build: {
    manifest: true,
    emptyOutDir: true,
    minify: isProduction,
    chunkSizeWarningLimit: 1024,
    reportCompressedSize: false,
    rollupOptions: { input: './client/main.tsx' },
    outDir: './.client',
  },
})
