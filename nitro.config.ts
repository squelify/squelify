import { isDevelopment, isProduction } from 'std-env'

/* https://nitro.unjs.io/config */
export default defineNitroConfig({
  preset: 'node-server',
  serveStatic: 'node',
  minify: isProduction,
  sourceMap: isDevelopment,
  appConfigFiles: ['~/config'],
  srcDir: 'server',
  renderer: '~/entry.server.ts',
  errorHandler: '~/error',
  publicAssets: [{ dir: '../.client' }],
  serverAssets: [{ baseName: 'vite', dir: '../.client/.vite' }],
  // prerender: {
  //   autoSubfolderIndex: true,
  //   crawlLinks: true,
  //   failOnError: false,
  //   routes: ['/'],
  // },
})
