import { isProduction } from 'std-env'

/* https://nitro.unjs.io/config */
export default defineNitroConfig({
  preset: 'node-server',
  serveStatic: 'node',
  minify: isProduction,
  srcDir: 'server',
  errorHandler: '~/error',
  prerender: {
    crawlLinks: true,
    failOnError: false,
    routes: ['/'],
  },
})
