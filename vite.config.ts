import path from 'node:path'
import react from '@vitejs/plugin-react'
import { isProduction, isTest } from 'std-env'
import { createLogger, defineConfig } from 'vite'
import inspect from 'vite-plugin-inspect'
import tsconfigPaths from 'vite-tsconfig-paths'

// @ts-ignore: FIXME fix the tsconfig.node.json
import logger from './server/utils/logger'

const viteLogger = createLogger()
const logMethods = ['info', 'error', 'warn', 'warnOnce'] as const

for (const method of logMethods) {
  viteLogger[method] = (msg: string) => {
    // Ignore empty CSS files warning
    if (method === 'warn' && msg.includes('vite:css') && msg.includes(' is empty')) return
    if (method in logger) {
      const loggerMethod = method === 'warnOnce' ? 'warn' : method
      ;(logger[loggerMethod as keyof typeof logger] as Function)('[vite]', msg)
    }
  }
}

export default defineConfig({
  plugins: [react(), inspect({ build: false, open: false }), tsconfigPaths()],
  appType: 'spa',
  clearScreen: true,
  envPrefix: ['APP_'],
  define: {
    'import.meta.env.APP_VERSION': `"${process.env.npm_package_version}"`,
  },
  envDir: path.join(__dirname),
  server: { port: 5173, strictPort: true },
  customLogger: !isTest ? viteLogger : undefined,
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
