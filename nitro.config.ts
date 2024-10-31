import 'dotenv/config'
import consola from 'consola'
import { makeDirectory } from 'make-dir'
import { resolve } from 'pathe'
import { isCI, isDevelopment, isProduction, isTest } from 'std-env'
import { build as buildVite } from 'vite'

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
