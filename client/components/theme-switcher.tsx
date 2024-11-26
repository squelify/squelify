import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuShortcut } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { Theme } from '#/context/stores/ui.store'
import { useTheme } from '#/providers/theme-provider'

export function ThemeSwitcher() {
  const { setTheme } = useTheme()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-8">
          <Lucide.Sun
            className="dark:-rotate-90 size-5 rotate-0 scale-100 transition-all dark:scale-0"
            strokeWidth={1.8}
          />
          <Lucide.Moon
            className="absolute size-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
            strokeWidth={1.8}
          />
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="ml-4">
        <DropdownMenuItem onClick={() => setTheme('light')}>
          <span>Light</span>
          <DropdownMenuShortcut>
            <Lucide.Sun className="size-4" strokeWidth={1.5} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('dark')}>
          <span>Dark</span>
          <DropdownMenuShortcut>
            <Lucide.Moon className="size-4" strokeWidth={1.5} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setTheme('system')}>
          <span>System</span>
          <DropdownMenuShortcut>
            <Lucide.MonitorDot className="size-4" strokeWidth={1.5} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

/**
 * ThemeSelector component allows users to select a theme from a dropdown menu.
 */
export function ThemeSelector() {
  const { setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState('system')

  // Function to get icon based on theme value
  const getIcon = (theme: string) => {
    switch (theme) {
      case 'light':
        return <Lucide.Sun className="size-4" strokeWidth={1.5} />
      case 'dark':
        return <Lucide.Moon className="size-4" strokeWidth={1.5} />
      case 'system':
        return <Lucide.MonitorDot className="size-4" strokeWidth={1.5} />
      default:
        return null
    }
  }

  // Function to handle theme change
  const handleThemeChange = (theme: Theme) => {
    setTheme(theme)
    setSelectedTheme(theme)
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          type="button"
          className="flex w-full items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground"
        >
          {getIcon(selectedTheme)}
          <span className="ml-2 capitalize">{selectedTheme} Theme</span>
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" side="right">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <div className="flex items-center">
            {getIcon('light')}
            <span className="ml-2">Light Theme</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <div className="flex items-center">
            {getIcon('dark')}
            <span className="ml-2">Dark Theme</span>
          </div>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('system')}>
          <div className="flex items-center">
            {getIcon('system')}
            <span className="ml-2">System Theme</span>
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
