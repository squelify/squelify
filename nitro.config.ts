import { isProduction } from 'std-env'

/* https://nitro.unjs.io/config */
export default defineNitroConfig({
  preset: 'node-server',
  minify: isProduction,
  srcDir: 'server',
  serveStatic: 'node',
  errorHandler: '~/error',
})
