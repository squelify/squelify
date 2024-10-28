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
  renderer: '~/entry.client',
  errorHandler: '~/error',
  publicAssets: [{ dir: '../public' }, { dir: '../.client' }],
  serverAssets: [{ baseName: 'vite', dir: '../.client/.vite' }],
  // TODO: modify rollupConfig to use React frontend
  typescript: {
    generateTsConfig: true,
    tsConfig: {
      compilerOptions: {
        jsx: 'react',
        jsxFactory: 'React.createElement',
        jsxFragmentFactory: 'React.Fragment',
        noEmit: true,
        skipLibCheck: true,
        strict: false,
        useDefineForClassFields: true,
        verbatimModuleSyntax: false,
        tsBuildInfoFile: '../../node_modules/.tsbuildinfo',
      },
      exclude: ['../../vite.config.ts', '../../client'],
    },
  },
})
