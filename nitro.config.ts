import 'dotenv/config'
import consola from 'consola'
import { makeDirectory } from 'make-dir'
import { resolve } from 'pathe'
import { isCI, isDevelopment, isProduction, isTest } from 'std-env'
import pkg from './package.json' assert { type: 'json' }

import react from '@vitejs/plugin-react'
// Dependencies for the frontend (Vite)
import { build as buildVite } from 'vite'
import { type LogLevel } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const viteLogger = {
  warn: (msg: string) => consola.warn(msg),
  warnOnce: (msg: string) => consola.warn(msg),
  error: (msg: string) => consola.error(msg),
  info: (msg: string) => consola.info(msg),
  hasWarned: false,
  clearScreen: () => {},
  hasErrorLogged: () => true,
  level: 'info' as LogLevel,
}

/**
 * Configures the Nitro server for the application.
 * @see https://nitro.unjs.io/config
 */
export default defineNitroConfig({
  srcDir: 'server',
  preset: 'node-server',
  serveStatic: 'inline',
  minify: isProduction,
  sourceMap: isDevelopment,
  appConfigFiles: ['app.config'],

  handlers: [
    {
      route: '/**',
      handler: '~/entry.client',
      lazy: true,
    },
  ],

  errorHandler: '~/error.handler',

  publicAssets: [{ dir: resolve('public') }],

  serverAssets: [
    // Frontend application assets
    { baseName: 'vite', dir: resolve('.output/client/.vite') },
  ],

  output: {
    dir: resolve('.output'),
    serverDir: resolve('.output/server'),
    publicDir: resolve('.output/client'),
  },

  hooks: {
    'rollup:before': async (_nitro, _config) => {
      consola.info('Creating data directory...')
      await makeDirectory(resolve('.data'), { mode: 0o755 })

      consola.info('Building frontend application...')
      await buildVite({
        clearScreen: true,
        // configFile: resolve('vite.config.ts'),
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
          // alias: [{ find: /^#\/(.*)$/, replacement: '#/$1' }],
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
        // server: { port: 5173, strictPort: true },
      }).then(() => consola.success('Frontend application built!'))
    },
    compiled: (_nitro) => {
      // Do something with the compiled Nitro instance.
      // You can upload the compiled assets to a CDN or do something else with them.
      if ((!isCI || !isTest) && isProduction) {
        consola.info('Do something after the app has been compiled')
      }
    },
  },

  // TODO: modify rollupConfig to use React frontend
  // esbuild: {
  //   options: {
  //     jsx: 'preserve',
  //   },
  // },
  // rollupConfig: {
  //   input: ['./client/main.tsx'],
  //   plugins: [],
  // },
  typescript: {
    tsConfig: {
      compilerOptions: {
        allowJs: true, // `false` for React
        allowSyntheticDefaultImports: true,
        forceConsistentCasingInFileNames: true,
        jsx: 'preserve', // `react-jsx` for React
        jsxFactory: 'h', // Disable for React
        jsxFragmentFactory: 'Fragment', // Disable for React
        module: 'ESNext',
        moduleResolution: 'Bundler',
        noEmit: true,
        resolveJsonModule: true,
        strict: false, // `true` for React
        target: 'ESNext',
        tsBuildInfoFile: '../../node_modules/.tsbuildinfo',
        // Extra options for React
        disableSizeLimit: false,
        esModuleInterop: true,
        incremental: true,
        lib: ['DOM', 'DOM.Iterable', 'ESNext'],
        moduleDetection: 'auto',
        noImplicitAny: false, // `true` for React
        noUncheckedIndexedAccess: true,
        skipLibCheck: true,
        useDefineForClassFields: true,
        verbatimModuleSyntax: false,
        paths: { '#/*': ['../../client/*'] },
      },
      include: ['../../client/**/*'],
    },
  },
})
