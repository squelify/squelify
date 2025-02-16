import { type ThemeVarsColors, create } from '@storybook/theming'

export type Theme = 'light' | 'dark' | 'system'

const brand: Partial<ThemeVarsColors> = {
  brandTitle: 'Squelify UI Components',
  brandUrl: 'https://www.squelify.com',
  fontBase: 'system-ui, Roboto, Ubuntu, "Helvetica Neue", Calibri, Arial, sans-serif',
  appBorderRadius: 4,
  inputBorderRadius: 4,
}

export const light = create({
  base: 'light',
  ...brand,
  // brandImage: '/images/storybook-light.svg',
  colorPrimary: '#0f131a',
  colorSecondary: '#0f131a',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appPreviewBg: '#ffffff',
  appBorderColor: '#e5e7eb',

  // Text colors
  textColor: '#0f131a',
  textMutedColor: '#6b7280',
  textInverseColor: '#ffffff',

  // Toolbar colors
  barTextColor: '#6b7280',
  barHoverColor: '#374151',
  barSelectedColor: '#1fa2ff',
  barBg: '#ffffff',

  // Form colors
  buttonBg: '#f3f4f6',
  buttonBorder: '#e5e7eb',
  inputBg: '#ffffff',
  inputBorder: '#e5e7eb',
  inputTextColor: '#0f131a',
})

export const dark = create({
  base: 'dark',
  ...brand,
  // brandImage: '/images/storybook-dark.svg',
  colorPrimary: '#ffffff',
  colorSecondary: '#374151',

  // UI
  appBg: '#0f131a',
  appContentBg: '#0f131a',
  appPreviewBg: '#0f131a',
  appBorderColor: '#374151',

  // Text colors
  textColor: '#ffffff',
  textMutedColor: '#9ca3af',
  textInverseColor: '#0f131a',

  // Toolbar colors
  barTextColor: '#9ca3af',
  barHoverColor: '#d1d5db',
  barSelectedColor: '#1fa2ff',
  barBg: '#0f131a',

  // Form colors
  buttonBg: '#1f2937',
  buttonBorder: '#374151',
  inputBg: '#111827',
  inputBorder: '#374151',
  inputTextColor: '#ffffff',
})
