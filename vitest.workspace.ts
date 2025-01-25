import { resolve } from 'pathe'
import { loadEnv } from 'vite'
import { defineWorkspace } from 'vitest/config'

export default defineWorkspace([
  {
    // Merge Vite config with Vitest config
    extends: './vite.config.ts',
    test: {
      name: 'client',
      environment: 'happy-dom',
      env: loadEnv('test', process.cwd(), ''),
      include: ['./tests/client/**/*.{test,spec}.{ts,tsx}'],
      setupFiles: ['./tests/setup-client.ts'],
    },
  },
  {
    test: {
      name: 'server',
      environment: 'node',
      alias: { '~': resolve('server'), '~~': resolve('.') },
      include: ['./tests/server/**/*.{test,spec}.ts'],
    },
  },
])
