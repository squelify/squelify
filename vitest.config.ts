import { process } from 'std-env'
import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    silent: true,
    hideSkippedTests: true,
    exclude: ['node_modules', 'tests-e2e'],
    reporters: process.env.CI ? ['html', 'github-actions'] : ['html', 'default'],
    outputFile: {
      json: './.output/tests-results/results.json',
      html: './.output/tests-results/index.html',
    },
    coverage: {
      provider: 'v8',
      reporter: ['html-spa', 'text-summary'],
      reportsDirectory: './.output/tests-results/coverage',
      include: ['./tests/**/*.{test,spec}.{ts,tsx}'],
      cleanOnRerun: true,
      clean: true,
    },
    globals: true,
  },
})
