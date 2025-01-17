import * as Lucide from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/base-ui'
import { DropdownMenuItem, DropdownMenuLabel } from '#/components/base-ui'
import { DropdownMenuContent, DropdownMenuGroup } from '#/components/base-ui'
import { DropdownMenu, DropdownMenuSeparator, DropdownMenuTrigger } from '#/components/base-ui'
import { SidebarMenuButton, useSidebar } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import { ThemeSwitcher } from '#/components/theme'
import type { UserInfo } from '#/services/types'
import { clx } from '#/utils/helper'

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
        className="w-(--radix-dropdown-menu-trigger-width) min-w-56 rounded-lg px-1"
        side={sidebarState === 'expanded' && isMobile ? 'top' : 'right'}
        align="end"
        sideOffset={4}
      >
        <DropdownMenuLabel className="p-0 font-normal">
          <div className="flex items-center gap-2 px-1 py-1.5 text-left text-sm">
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatarUrl} alt={user.displayName} />
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
            <Link href="https://squelify.com/docs?utm_source=squelify&utm_medium=profile" newTab>
              <Lucide.ExternalLink strokeWidth={1.8} />
              <span>Documentation</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem asChild>
            <Link href="https://github.com/squelify/squelify?utm_source=squelify" newTab>
              <Lucide.ExternalLink strokeWidth={1.8} />
              <span>Source Code</span>
            </Link>
          </DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem asChild>
            <ThemeSwitcher />
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
