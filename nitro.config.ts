import consola from 'consola'
import { isDevelopment, isProduction } from 'std-env'

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
    'rollup:before': (_nitro, _config) => {
      consola.info('Do something before rollup is executed')
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
