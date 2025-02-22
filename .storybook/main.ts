import type { StorybookConfig } from '@storybook/react-vite'
import { mergeConfig } from 'vite'
import tsconfigPaths from 'vite-tsconfig-paths'

const config: StorybookConfig = {
  stories: ['./_docs/**/*.mdx', '../client/**/*.mdx', '../client/**/*.stories.@(ts|tsx)'],
  addons: [
    {
      name: '@storybook/addon-essentials',
      options: { backgrounds: false, controls: true, actions: true },
    },
    '@storybook/addon-links',
    '@storybook/addon-a11y',
  ],
  framework: {
    name: '@storybook/react-vite',
    options: {
      strictMode: true,
    },
  },
  core: {
    disableTelemetry: true, // 👈 Disables telemetry
    enableCrashReports: false, // 👈 Appends the crash reports to the telemetry events
    disableWhatsNewNotifications: true, // 👈 Disables the whats new notification
    disableProjectJson: true, // 👈 Disables project.json generation
  },
  async viteFinal(config) {
    return mergeConfig(config, {
      plugins: [tsconfigPaths()],
      build: {
        chunkSizeWarningLimit: 1024 * 4,
        reportCompressedSize: false,
      },
    })
  },
}

export default config
