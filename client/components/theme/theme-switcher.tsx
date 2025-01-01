import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui'
import { DropdownMenu, DropdownMenuShortcut, DropdownMenuTrigger } from '#/components/base-ui'
import { DropdownMenuContent, DropdownMenuItem } from '#/components/base-ui'
import { useTheme } from '#/context/hooks/use-theme'

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
