import { create } from '@storybook/theming'

const light = create({
  base: 'light',

  colorPrimary: 'rgb(31, 162, 255)',
  colorSecondary: 'rgb(31, 162, 255)',

  // UI
  appBg: '#ffffff',
  appContentBg: '#ffffff',
  appBorderColor: 'rgb(234, 234, 234)',
  appBorderRadius: 5,

  // Typography
  fontBase:
    "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
  fontCode:
    "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",

  // Text colors
  textColor: 'rgb(10, 10, 10)',
  textInverseColor: 'rgb(250, 250, 250)',

  // Toolbar default and active colors
  barTextColor: 'rgb(10, 10, 10)',
  barSelectedColor: 'rgb(31, 162, 255)',
  barBg: '#ffffff',

  // Form colors
  inputBg: '#ffffff',
  inputBorder: 'rgb(234, 234, 234)',
  inputTextColor: 'rgb(10, 10, 10)',
  inputBorderRadius: 5,

  brandUrl: '/?path=/docs/getting-started--docs',
  brandTarget: '_self',
})

const dark = create({
  base: 'dark',

  colorPrimary: 'rgb(73, 195, 255)',
  colorSecondary: 'rgb(73, 195, 255)',

  // UI
  appBg: 'rgb(10, 10, 10)',
  appContentBg: 'rgb(10, 10, 10)',
  appBorderColor: 'rgb(59, 59, 59)',
  appBorderRadius: 5,

  // Typography
  fontBase:
    "Seravek, 'Gill Sans Nova', Ubuntu, Calibri, 'DejaVu Sans', source-sans-pro, sans-serif",
  fontCode:
    "ui-monospace, 'Cascadia Code', 'Source Code Pro', Menlo, Consolas, 'DejaVu Sans Mono', monospace",

  // Text colors
  textColor: 'rgb(250, 250, 250)',
  textInverseColor: 'rgb(10, 10, 10)',

  // Toolbar default and active colors
  barTextColor: 'rgb(250, 250, 250)',
  barSelectedColor: 'rgb(73, 195, 255)',
  barBg: 'rgb(10, 10, 10)',

  // Form colors
  inputBg: 'rgb(59, 59, 59)',
  inputBorder: 'rgb(59, 59, 59)',
  inputTextColor: 'rgb(250, 250, 250)',
  inputBorderRadius: 5,

  brandUrl: '/?path=/docs/getting-started--docs',
  brandTarget: '_self',
})

export default { light, dark }
