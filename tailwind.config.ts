import type { Config } from 'tailwindcss'
import colors from 'tailwindcss/colors'
import { fontFamily } from 'tailwindcss/defaultTheme'

export default {
  content: ['./client/**/*!(*.stories|*.spec|*.test).{ts,tsx}'],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        sans: ['Inter Variable', ...fontFamily.sans],
        mono: ['JetBrains Mono Variable', ...fontFamily.mono],
      },
      colors: {
        primary: colors.indigo,
        destructive: colors.red,
      },
    },
    debugScreens: {
      position: ['bottom', 'right'],
      borderTopLeftRadius: '4px',
      printSize: false,
      prefix: '',
    },
  },
  plugins: [
    require('@tailwindcss/forms'),
    require('@tailwindcss/aspect-ratio'),
    require('@tailwindcss/typography'),
    require('tailwindcss-animate'),
    require('tailwindcss-motion'),
    require('tailwind-debug-breakpoints'),
  ],
} satisfies Config
