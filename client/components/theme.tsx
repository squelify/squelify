import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Button, DropdownMenu, DropdownMenuContent } from '#/components/base-ui'
import { DropdownMenuItem, DropdownMenuTrigger, useSidebar } from '#/components/base-ui'
import { useTheme } from '#/context/hooks/use-theme'
import { Theme } from '#/context/stores/ui.store'
import { clx } from '#/utils/helper'

type ThemeSelectorProps = {
  mode?: 'toggle' | 'dropdown'
  showTitle?: boolean
}

export function ThemeSelector({ mode = 'toggle', showTitle = false }: ThemeSelectorProps) {
  const { theme, setTheme } = useTheme()

  if (mode === 'dropdown') {
    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" className="gap-1.5">
            {theme === 'light' && (
              <>
                <Lucide.Sun className="size-4" />
                {showTitle && <span>Light</span>}
              </>
            )}
            {theme === 'dark' && (
              <>
                <Lucide.Moon className="size-4" />
                {showTitle && <span>Dark</span>}
              </>
            )}
            {theme === 'system' && (
              <>
                <Lucide.Laptop className="size-4" />
                {showTitle && <span>System</span>}
              </>
            )}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          <DropdownMenuItem onClick={() => setTheme('light')}>
            <Lucide.Sun className="mr-2 size-4" />
            Light
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('dark')}>
            <Lucide.Moon className="mr-2 size-4" />
            Dark
          </DropdownMenuItem>
          <DropdownMenuItem onClick={() => setTheme('system')}>
            <Lucide.Laptop className="mr-2 size-4" />
            System
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    )
  }

  return (
    <Button
      variant="outline"
      className="relative gap-1.5"
      onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}
      title={theme === 'light' ? 'Enable dark mode' : 'Enable light mode'}
    >
      <div className="relative size-4">
        <Lucide.Sun
          className={clx(
            'absolute inset-0 size-4 rotate-0 scale-100 transition-all dark:scale-0',
            showTitle && '-ml-0.5'
          )}
        />
        <Lucide.Moon
          className={clx(
            'absolute inset-0 size-4 rotate-0 scale-0 transition-all dark:scale-100',
            showTitle && '-ml-0.5'
          )}
        />
      </div>
      {showTitle && <span>{theme === 'light' ? 'Light' : 'Dark'}</span>}
      <span className="sr-only">Toggle theme</span>
    </Button>
  )
}

// Theme options configuration
const THEME_OPTIONS = {
  light: {
    icon: Lucide.Sun,
    label: 'Light Theme',
  },
  dark: {
    icon: Lucide.Moon,
    label: 'Dark Theme',
  },
  system: {
    icon: Lucide.MonitorDot,
    label: 'System Theme',
  },
} as const

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme()
  const { state: sidebarState, isMobile } = useSidebar()

  // Memoize theme options to prevent unnecessary re-renders
  const themeEntries = React.useMemo(() => Object.entries(THEME_OPTIONS), [])

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className={clx(
            'flex w-full items-center rounded-xs px-2 py-1.5 text-sm outline-none transition-colors',
            'hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground'
          )}
        >
          {React.createElement(THEME_OPTIONS[theme].icon, {
            className: 'size-4',
            strokeWidth: 1.5,
          })}
          <span className="ml-2">{THEME_OPTIONS[theme].label}</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        align="end"
        side={sidebarState === 'expanded' && isMobile ? 'top' : 'right'}
      >
        {themeEntries.map(([themeKey, { icon: Icon, label }]) => (
          <DropdownMenuItem key={themeKey} onClick={() => setTheme(themeKey as Theme)}>
            <div className="flex items-center">
              <Icon className="size-4" strokeWidth={1.5} />
              <span className="ml-2">{label}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
