import { isDevelopment, isProduction } from 'std-env'

/* https://nitro.unjs.io/config */
export default defineNitroConfig({
  preset: 'node-server',
  serveStatic: 'node',
  minify: isProduction,
  sourceMap: isDevelopment,
  srcDir: 'server',
  errorHandler: '~/error',
  appConfigFiles: ['~/config'],
  prerender: {
    autoSubfolderIndex: true,
    crawlLinks: true,
    failOnError: false,
    routes: ['/'],
  },
})
