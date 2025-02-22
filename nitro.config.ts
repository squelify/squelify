/**
 * TODO: migrate to Vite plugin (https://www.npmjs.com/package/@analogjs/vite-plugin-nitro)
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
import pkg from './package.json' with { type: 'json' }

export default defineNitroConfig({
  compatibilityDate: '2025-02-19',
  preset: 'node-server',
  serveStatic: 'node',
  srcDir: 'server',
  minify: isProduction,
  sourceMap: isDevelopment,
  appConfig: appConfig,

  renderer: '~/entry.server',
  errorHandler: '~/handler/error.handler',
  handlers: [
    { route: '/robots.txt', handler: '~/handler/robots.handler', lazy: true },
    { route: '/site.webmanifest', handler: '~/handler/manifest.handler', lazy: true },
  ],

  publicAssets: [{ dir: resolve('public') }],
  serverAssets: [{ baseName: 'vite', dir: resolve('build/client/.vite') }],
  compressPublicAssets: { gzip: isProduction, brotli: isProduction },

  output: {
    dir: resolve('build'),
    serverDir: resolve('build/server'),
    publicDir: resolve('build/client'),
  },

  hooks: {
    'rollup:before': async (nitro, _config) => {
      consola.withTag('nitro').info('Creating data directory...')
      await makeDirectory(resolve('sqdata'), { mode: 0o755 })

      if (!nitro.options.dev) {
        consola.withTag('nitro').info('Building frontend application...')
        await vite().then(() => consola.withTag('nitro').success('Frontend application built!'))
      }
    },
  },

  openAPI: {
    production: 'prerender',
    route: '/_/api-specs.json',
    meta: {
      title: 'Squelify API',
      description: 'Squelify API documentation',
      version: pkg.version,
    },
    ui: {
      scalar: {
        route: '/_/api-docs',
        layout: 'modern',
        theme: 'purple',
      },
      swagger: false,
    },
  },

  devServer: { watch: ['server', 'client', 'sqdata/functions', 'sqdata/public_html'] },
  typescript: { strict: true, generateTsConfig: false },
  esbuild: { options: { jsx: 'automatic' } },
  experimental: { openAPI: isDevelopment },
})
