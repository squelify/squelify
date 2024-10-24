import { isDevelopment, isProduction } from 'std-env'

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
  appConfigFiles: ['~/config'],
  renderer: '~/renderer',
  errorHandler: '~/error',
  // rollupConfig: {
  //   jsx: {
  //     mode: 'preserve',
  //     preset: 'react-jsx',
  //     factory: 'React.createElement"',
  //     fragment: 'React.Fragment',
  //   },
  // },
  publicAssets: [{ dir: '../public' }, { dir: '../.client' }],
  serverAssets: [{ baseName: 'vite', dir: '../.client/.vite' }],
})
