import * as Lucide from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/base-ui/avatar'
import { DropdownMenuItem, DropdownMenuLabel } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent, DropdownMenuGroup } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuSeparator, DropdownMenuShortcut } from '#/components/base-ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { SidebarMenuButton, useSidebar } from '#/components/base-ui/sidebar'
import { Link } from '#/components/link'
import { ThemeSelector } from '#/components/theme-switcher'
import type { UserInfo } from '#/services/types'

interface UserMenuProps {
  user: UserInfo
  sidebarState: 'expanded' | 'collapsed'
  logout: () => void
}

export default function UserMenu({ user, sidebarState, logout }: UserMenuProps) {
  const { isMobile } = useSidebar()

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-sidebar-accent data-[state=open]:text-sidebar-accent-foreground"
        >
          <Avatar className="h-8 w-8 rounded-lg">
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
        side={sidebarState === 'collapsed' || isMobile ? 'bottom' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback className="rounded-lg">
                <Lucide.CircleUser className="size-8 rounded-lg" strokeWidth={1.8} />
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
          <DropdownMenuItem asChild>
            <Link href="/docs">
              <Lucide.ExternalLink strokeWidth={1.8} />
              <span>Documentation</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>
            <Lucide.Bell strokeWidth={1.8} />
            Notifications
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <ThemeSelector />
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
