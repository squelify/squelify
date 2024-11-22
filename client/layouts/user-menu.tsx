import * as Lucide from 'lucide-react'
import { Avatar, AvatarFallback, AvatarImage } from '#/components/base-ui/avatar'
import { DropdownMenuContent, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuSeparator, DropdownMenuShortcut } from '#/components/base-ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { SidebarMenuButton } from '#/components/base-ui/sidebar'
import { Link } from '#/components/link'
import type { UserInfo } from '#/services/types'
import { clx } from '#/utils/helper'

interface UserMenuProps {
  user: UserInfo
  sidebarState: 'expanded' | 'collapsed'
  logout: () => void
}

export default function UserMenu({ user, sidebarState, logout }: UserMenuProps) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <SidebarMenuButton>
          {user.avatarUrl ? (
            <Avatar className="size-5">
              <AvatarImage src={user.avatarUrl} alt={user.username} />
              <AvatarFallback>
                <Lucide.CircleUser strokeWidth={1.8} />
              </AvatarFallback>
            </Avatar>
          ) : (
            <Lucide.CircleUser className="size-5" strokeWidth={1.8} />
          )}
          <span>{user.displayName}</span>
          <Lucide.ChevronUp className="ml-auto" strokeWidth={1.8} />
        </SidebarMenuButton>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        side={sidebarState === 'expanded' ? 'top' : 'right'}
        className={clx(sidebarState === 'expanded' ? 'ml-4' : 'ml-0', 'mb-2 w-56')}
      >
        <DropdownMenuItem asChild>
          <Link href="/account">
            <span>Account Settings</span>
            <DropdownMenuShortcut>
              <Lucide.UserRoundCog className="size-3" strokeWidth={1.8} />
            </DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem asChild>
          <Link href="/docs" newTab>
            <span>Documentation</span>
            <DropdownMenuShortcut>
              <Lucide.ExternalLink className="size-3" strokeWidth={1.8} />
            </DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuItem asChild>
          <Link href="/github" newTab>
            <span>Source Code</span>
            <DropdownMenuShortcut>
              <Lucide.ExternalLink className="size-3" strokeWidth={1.8} />
            </DropdownMenuShortcut>
          </Link>
        </DropdownMenuItem>
        <DropdownMenuSeparator />
        <DropdownMenuItem onClick={logout}>
          <span>Sign Out</span>
          <DropdownMenuShortcut>
            <Lucide.LogOut className="size-3" strokeWidth={1.8} />
          </DropdownMenuShortcut>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
