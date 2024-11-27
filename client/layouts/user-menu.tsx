import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/base-ui/avatar'
import { DropdownMenuItem, DropdownMenuLabel } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent, DropdownMenuGroup } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuSeparator } from '#/components/base-ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from '#/components/base-ui/sidebar'
import { Link } from '#/components/link'
import { Theme } from '#/context/stores/ui.store'
import { useTheme } from '#/providers/theme-provider'
import type { UserInfo } from '#/services/types'
import { clx } from '#/utils/helper'

interface UserMenuProps {
  user: UserInfo
  sidebarState: 'expanded' | 'collapsed'
  logout: () => void
}

export default function UserMenu({ user, sidebarState, logout }: UserMenuProps) {
  const { isMobile } = useSidebar()
  const { setTheme } = useTheme()
  const [selectedTheme, setSelectedTheme] = useState<Theme>('system')

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
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar
            className={clx(sidebarState === 'collapsed' ? 'block' : 'hidden', 'size-8 rounded-lg')}
          >
            <AvatarImage src={user.avatarUrl} alt={user.displayName} />
            <AvatarFallback className="rounded-lg bg-transparent">
              <Lucide.CircleUser strokeWidth={1.8} />
            </AvatarFallback>
          </Avatar>
          <div className="grid flex-1 text-left text-sm leading-tight">
            <span className="truncate font-semibold">{user.displayName}</span>
            <span className="truncate text-xs">{user.email}</span>
          </div>
          <Lucide.ChevronsUpDown className="ml-auto size-4" strokeWidth={1.8} />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-[--radix-dropdown-menu-trigger-width] min-w-56 rounded-lg px-1"
        side={sidebarState === 'expanded' && isMobile ? 'top' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="rounded-lg bg-transparent">
                <Lucide.CircleUser className="size-8 rounded-lg" strokeWidth={1.6} />
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.displayName}</span>
              <span className="truncate text-xs">{user.email}</span>
            </div>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <Link href="/account">
              <Lucide.UserRoundCog strokeWidth={1.8} />
              <span>Account Settings</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href="/docs">
              <Lucide.ExternalLink strokeWidth={1.8} />
              <span>Documentation</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="/github">
              <Lucide.ExternalLink strokeWidth={1.8} />
              <span>Source Code</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            {/* Start Theme Selector */}
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
              <DropdownMenuContent
                align="end"
                side={sidebarState === 'expanded' && isMobile ? 'top' : 'right'}
              >
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
            {/* End Theme Selector */}
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <Lucide.LogOut strokeWidth={1.8} />
          Log out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
