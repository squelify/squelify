import 'dotenv/config'
import consola from 'consola'
import { makeDirectory } from 'make-dir'
import { resolve } from 'pathe'
import { isCI, isDevelopment, isProduction, isTest } from 'std-env'
import { build as buildVite } from 'vite'
import pkg from './package.json' assert { type: 'json' }

/**
 * Configures the Nitro server for the application.
 * @see https://nitro.unjs.io/config
 */
export default defineNitroConfig({
  srcDir: 'server',
  preset: 'node-server',
  serveStatic: 'node',
  minify: isProduction,
  sourceMap: isDevelopment,
  compatibilityDate: '2024-11-02',
  appConfigFiles: ['~/app.config'],

  // handlers: [
  //   // TODO: allow index route to be served by the frontend
  //   { route: '/ui', handler: '~/entry.client', lazy: true },
  //   { route: '/ui/**', handler: '~/entry.client', lazy: true },
  // ],

  // routeRules: {
  //   '/': { redirect: '/ui/**' },
  //   '/ui/**': { static: true, prerender: false },
  // },

  errorHandler: '~/error.handler',
  publicAssets: [{ dir: resolve('public') }],

  serverAssets: [
    // Frontend application assets
    { baseName: 'vite', dir: resolve('.output/client/.vite') },
    { baseName: 'migrations', dir: resolve('server/database/migrations') },
  ],

  output: {
    dir: resolve('.output'),
    serverDir: resolve('.output/server'),
    publicDir: resolve('.output/client'),
  },

  hooks: {
    'rollup:before': async (_nitro, _config) => {
      consola.info('Creating data directory...')
      await makeDirectory(resolve('_data'), { mode: 0o755 })

      consola.info('Building frontend application...')
      await buildVite().then(() => consola.success('Frontend application built!'))
    },
    compiled: (_nitro) => {
      // Do something with the compiled Nitro instance.
      // You can upload the compiled assets to a CDN or do something else with them.
      if ((!isCI || !isTest) && isProduction) {
        consola.info('Do something after the app has been compiled')
      }
    },
  },

  experimental: {
    openAPI: false,
  },

  openAPI: {
    production: 'prerender',
    route: '/api-specs.json',
    meta: {
      title: 'Fastrue API',
      description: 'Fastrue API documentation',
      version: pkg.version,
    },
    ui: {
      scalar: {
        route: '/api-docs',
        layout: 'modern',
        theme: 'purple',
      },
      swagger: false,
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
        // jsx: 'react-jsx', // preserve | `react-jsx` for React
        // jsxFactory: 'React.createElement', // Disable for React or React.createElement
        // jsxFragmentFactory: 'React.Fragment', // Disable for React or React.Fragment
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
