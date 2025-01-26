/**
 * Configures the Nitro server for the application.
 * @see https://nitro.unjs.io/config
 */

import 'dotenv/config'
import consola from 'consola'
import { makeDirectory } from 'make-dir'
import { defineNitroConfig } from 'nitropack/config'
import { resolve } from 'pathe'
import { isDevelopment, isProduction } from 'std-env'
import { build as vite } from 'vite'
import appConfig from './app.config'
import pkg from './package.json' assert { type: 'json' }

export default defineNitroConfig({
  compatibilityDate: '2025-01-23',
  preset: 'node-server',
  serveStatic: 'node',
  srcDir: 'server',
  minify: isProduction,
  sourceMap: isDevelopment,
  appConfig: appConfig,

  renderer: '~/entry.server',
  errorHandler: '~/handler/error.handler',
  handlers: [
    { route: '/robots.txt', handler: '~/handler/robots.handler' },
    { route: '/site.webmanifest', handler: '~/handler/manifest.handler' },
    { route: '/setup', handler: '~/handler/setup.handler', method: 'post' },
  ],

  publicAssets: [{ dir: resolve('public') }],
  serverAssets: [{ baseName: 'vite', dir: resolve('.output/client/.vite') }],
  compressPublicAssets: { gzip: isProduction, brotli: isProduction },

  output: {
    dir: resolve('.output'),
    serverDir: resolve('.output/server'),
    publicDir: resolve('.output/client'),
  },

  hooks: {
    'rollup:before': async (nitro, _config) => {
      consola.withTag('nitro').info('Creating data directory...')
      await makeDirectory(resolve('_data'), { mode: 0o755 })

      if (!nitro.options.dev) {
        consola.withTag('nitro').info('Building frontend application...')
        await vite().then(() => consola.withTag('nitro').success('Frontend application built!'))
      }
    },
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

  devServer: { watch: ['server', 'client', '_data/functions', '_data/public_html'] },
  typescript: { strict: true, generateTsConfig: false },
  esbuild: { options: { jsx: 'automatic' } },
  experimental: { openAPI: isDevelopment },
})
