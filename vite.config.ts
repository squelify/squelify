import 'dotenv/config'
import react from '@vitejs/plugin-react'
import consola from 'consola'
import { isProduction, isTest, process } from 'std-env'
import { type LogLevel, defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

const logger = {
  warn: (msg: string) => consola.warn(msg),
  warnOnce: (msg: string) => consola.warn(msg),
  error: (msg: string) => consola.error(msg),
  info: (msg: string) => consola.info(msg),
  hasWarned: false,
  clearScreen: () => {},
  hasErrorLogged: () => true,
  level: 'info' as LogLevel,
}

export default defineConfig({
  plugins: [react(), inspect({ build: false, open: false }), tsconfigPaths()],
  envPrefix: 'APP_',
  define: {
    'import.meta.env.APP_VERSION': `"${process.env.npm_package_version}"`,
  },
  appType: 'spa',
  clearScreen: true,
  server: { port: 5173, strictPort: true },
  customLogger: !isTest ? logger : undefined,
  optimizeDeps: {
    /**
     * Excludes the specified packages from the Vite dependency optimization.
     * This can be useful to exclude packages that are not needed in the production build,
     * or to exclude packages that are causing issues during the build process.
     */
    exclude: ['react/jsx-runtime'],
  },
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
