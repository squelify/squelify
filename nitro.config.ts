import consola from 'consola'
import { resolve } from 'pathe'
import { isDevelopment, isProduction } from 'std-env'
import { build as buildVite } from 'vite'

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
  appConfigFiles: ['~/config'],
  renderer: '~/entry.client',
  errorHandler: '~/error',
  publicAssets: [{ dir: '../public' }, { dir: '../.client' }],
  serverAssets: [{ baseName: 'vite', dir: '../.client/.vite' }],

  hooks: {
    'rollup:before': async (_nitro, _config) => {
      consola.info('Building frontend application...')
      await buildVite({
        configFile: resolve('vite.config.ts'),
      }).then(() => consola.success('Frontend application built!'))
    },
    compiled: (_nitro) => {
      // Do something with the compiled Nitro instance.
      // You can upload the compiled assets to a CDN or do something else with them.
      // if ((!isCI || !isTest) && isProduction) {
      //   consola.info('Do something after the app has been compiled')
      // }
      consola.info('Do something after the app has been compiled')
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
  // typescript: {
  //   tsConfig: {
  //     compilerOptions: {
  //       jsx: 'react',
  //       jsxFactory: 'React.createElement',
  //       jsxFragmentFactory: 'React.Fragment',
  //       noEmit: true,
  //       skipLibCheck: true,
  //       strict: false,
  //       useDefineForClassFields: true,
  //       verbatimModuleSyntax: false,
  //       tsBuildInfoFile: '../../node_modules/.tsbuildinfo',
  //     },
  //     exclude: ['../../vite.config.ts', '../../client'],
  //   },
  // },
})
