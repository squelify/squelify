import { useContext, useEffect } from 'react'
import { ThemeProviderContext } from '#/context/providers/theme-provider'
import { type Theme } from '#/context/stores/ui.store'

export const useTheme = () => {
  const context = useContext(ThemeProviderContext)

  if (context === undefined) throw new Error('useTheme must be used within a AppProvider')

  return context
}

export const useThemeHandler = (theme: Theme) => {
  useEffect(() => {
    const root = document.documentElement

    // Update data-theme accordingly if user selects light or dark
    if (theme !== 'system') {
      root.dataset.theme = theme
      return
    }

    // For auto mode, we need to watch system preferences
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')

    // Set initial theme based on system preference
    root.dataset.theme = mediaQuery.matches ? 'dark' : 'light'

    // Update theme when system preference changes
    function handleChange(event: MediaQueryListEvent) {
      root.dataset.theme = event.matches ? 'dark' : 'light'
    }

    mediaQuery.addEventListener('change', handleChange)
    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [theme])
}
