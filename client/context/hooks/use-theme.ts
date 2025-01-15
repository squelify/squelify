import { useContext, useEffect } from 'react'
import { AppContext } from '#/context/providers/app-provider'
import { type Theme } from '#/context/stores/ui.store'

export const useTheme = () => {
  const context = useContext(AppContext)

  if (context === undefined) throw new Error('useTheme must be used within a AppProvider')

  return context
}

export const useThemeHandler = (theme: Theme) => {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.remove('light', 'dark')

    if (theme === 'system') {
      const systemTheme = window.matchMedia('(prefers-color-scheme: dark)').matches
        ? 'dark'
        : 'light'
      root.classList.add(systemTheme)
      return
    }

    root.classList.add(theme)
  }, [theme])
}
