import { resolve } from 'node:path'
import react from '@vitejs/plugin-react'
import consola from 'consola'
import { isProduction, isTest } from 'std-env'
import { type Logger as ViteLogger, defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json' assert { type: 'json' }

const viteLogger: ViteLogger = {
  info: (msg: string) => consola.info(msg),
  warn: (msg: string) => consola.warn(msg),
  warnOnce: (msg: string) => consola.warn(msg),
  error: (msg: string) => consola.error(msg),
  clearScreen: () => {},
  hasErrorLogged: () => true,
  hasWarned: false,
}

// TODO: move to `nitro.config.ts`
export default defineConfig({
  clearScreen: true,
  plugins: [react(), tsconfigPaths()],
  appType: 'spa',
  envPrefix: 'APP_',
  define: { 'import.meta.env.APP_VERSION': `"${pkg.version}"` },
  publicDir: resolve('public'),
  optimizeDeps: {
    /**
     * Excludes the specified packages from the Vite dependency optimization.
     * This can be useful to exclude packages that are not needed in the production build,
     * or to exclude packages that are causing issues during the build process.
     */
    exclude: ['react/jsx-runtime'],
  },
  resolve: {
    alias: [{ find: '#', replacement: resolve('client') }],
  },
  build: {
    manifest: true,
    emptyOutDir: true,
    minify: isProduction,
    chunkSizeWarningLimit: 1024,
    reportCompressedSize: false,
    rollupOptions: { input: resolve('client/main.tsx') },
    outDir: resolve('.output/client'),
  },
  customLogger: !isTest ? viteLogger : undefined,
})
