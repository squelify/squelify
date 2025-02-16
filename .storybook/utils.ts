import { GLOBALS_UPDATED } from '@storybook/core-events'
import { Theme } from './themes'

type EventListener = (
  eventName: string,
  callback: (context: { globals: Record<string, unknown> }) => void
) => void

export function listenToColorScheme(
  eventEmitter: { on: EventListener; off: EventListener },
  callback: (theme: Theme) => void
) {
  const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

  const handleMediaChange = (event: MediaQueryListEvent) => {
    callback(event.matches ? 'dark' : 'light')
  }

  const handleGlobalsChange = ({ globals }) => {
    const theme = globals.theme as Theme

    if (theme === 'system') {
      callback(mediaQuery.matches ? 'dark' : 'light')
      mediaQuery.addEventListener('change', handleMediaChange)
    } else {
      callback(theme)
      mediaQuery.removeEventListener('change', handleMediaChange)
    }
  }

  const initColorScheme = () => {
    const globals = new URL(window.location.href).searchParams.get('globals')

    if (globals) {
      const [key, value] = globals.split(':')
      if (key === 'theme') {
        return handleGlobalsChange({ globals: { theme: value } })
      }
    }

    handleGlobalsChange({ globals: { theme: 'system' } })
  }

  initColorScheme()

  eventEmitter.on(GLOBALS_UPDATED, handleGlobalsChange)

  return () => {
    eventEmitter.off(GLOBALS_UPDATED, handleGlobalsChange)
  }
}
