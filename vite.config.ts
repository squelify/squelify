import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'
import consola from 'consola'
import { resolve } from 'pathe'
import { isProduction, isTest } from 'std-env'
import { type Logger as ViteLogger, defineConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

export default defineConfig({
  clearScreen: true,
  plugins: [
    react(),
    tailwindcss(),
    tsconfigPaths(),
    {
      // Removes pure annotations warning on build from `@glideapps/glide-data-grid`
      // @ref: https://github.com/dotnet/aspnetcore/issues/55286#issuecomment-2557288741
      name: 'remove-pure-annotations',
      enforce: 'pre',
      transform(code, id) {
        if (id.includes('node_modules/@glideapps/glide-data-grid')) {
          return code.replace(/\/\*#__PURE__\*\//g, '')
        }
        return null
      },
    },
  ],
  envPrefix: 'SQUELIFY_',
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
    },
    outDir: resolve('build/client'),
  },
  customLogger: !isTest
    ? ({
        info: (msg: string) => consola.withTag('vite').info(msg),
        warn: (msg: string) => consola.withTag('vite').warn(msg),
        warnOnce: (msg: string) => consola.withTag('vite').warn(msg),
        error: (msg: string) => consola.withTag('vite').error(msg),
        clearScreen: () => {},
        hasErrorLogged: () => true,
        hasWarned: false,
      } as ViteLogger)
    : undefined,
})
