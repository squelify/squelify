// TODO: move to `nitro.config.ts`

import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import consola from 'consola'
import { resolve } from 'pathe'
import { isProduction, isTest } from 'std-env'
import { type Logger as ViteLogger, defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'
import pkg from './package.json' assert { type: 'json' }

export default defineConfig({
  clearScreen: true,
  plugins: [react(), tailwindcss(), tsconfigPaths()],
  appType: 'spa',
  envPrefix: 'SQUELIFY_',
  define: { 'import.meta.env.SQUELIFY_VERSION': `"${pkg.version}"` },
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
    alias: [
      { find: '#', replacement: resolve('client') },
      { find: '~', replacement: resolve('server') },
    ],
  },
  build: {
    manifest: true,
    emptyOutDir: true,
    minify: isProduction,
    chunkSizeWarningLimit: 1024 * 8,
    reportCompressedSize: false,
    rollupOptions: {
      input: resolve('client/entry.client.tsx'),
      // external: ['@glideapps/glide-data-grid'],
    },
    outDir: resolve('.output/client'),
  },
  customLogger: !isTest
    ? ({
        info: (msg: string) => consola.info(msg),
        warn: (msg: string) => consola.warn(msg),
        warnOnce: (msg: string) => consola.warn(msg),
        error: (msg: string) => consola.error(msg),
        clearScreen: () => {},
        hasErrorLogged: () => true,
        hasWarned: false,
      } as ViteLogger)
    : undefined,
})
