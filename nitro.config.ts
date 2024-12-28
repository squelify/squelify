/**
 * Configures the Nitro server for the application.
 * @see https://nitro.unjs.io/config
 */

import 'dotenv/config'
import consola from 'consola'
import { makeDirectory } from 'make-dir'
import { defineNitroConfig } from 'nitropack/config'
import { resolve } from 'pathe'
import { isCI, isDevelopment, isProduction, isTest } from 'std-env'
import { build as vite } from 'vite'
import pkg from './package.json' assert { type: 'json' }

export default defineNitroConfig({
  compatibilityDate: '2024-11-24',
  preset: 'node-server',
  serveStatic: 'node',
  srcDir: 'server',
  minify: isProduction,
  sourceMap: isDevelopment,
  appConfigFiles: ['~~/app.config'],
  errorHandler: '~/handler/error.handler',
  renderer: '~/entry.server.ts',

  handlers: [
    { route: '/installer', handler: '~/handler/installer.handler' },
    { route: '/robots.txt', handler: '~/handler/robots.handler' },
  ],

  routeRules: {
    '/docs': {
      redirect: 'https://squelify.com/docs?utm_source=squelify&utm_medium=profile',
      prerender: false,
    },
    '/github': {
      redirect: 'https://github.com/squelify/squelify',
      prerender: false,
    },
  },

  publicAssets: [{ dir: resolve('public') }],
  serverAssets: [{ baseName: 'vite', dir: resolve('.output/client/.vite') }],
  compressPublicAssets: { gzip: isProduction, brotli: isProduction },

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
      await vite().then(() => consola.success('Frontend application built!'))
    },
    compiled: (_nitro) => {
      // Do something with the compiled Nitro instance.
      // You can upload the compiled assets to a CDN or do something else with them.
      if ((!isCI || !isTest) && isProduction) {
        consola.info('Do something after the app has been compiled')
      }
    },
  },

  devServer: { watch: ['server', 'client', '_data/functions', '_data/public_html'] },
  esbuild: { options: { jsx: 'automatic' } },

  // TODO: modify rollupConfig instead of Vite to use React frontend
  // This is a temporary workaround, with a better solution coming in the future!
  typescript: { strict: true, generateTsConfig: false },

  experimental: {
    openAPI: isDevelopment,
  },

  openAPI: {
    production: 'prerender',
    route: '/api-specs.json',
    meta: {
      title: 'Squelify API',
      description: 'Squelify API documentation',
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
})
