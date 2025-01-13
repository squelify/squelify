import * as Lucide from 'lucide-react'
import { useLocation } from 'react-router'
import { Button } from '#/components/base-ui'
import { SidebarFooter, SidebarHeader } from '#/components/base-ui'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '#/components/base-ui'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '#/components/base-ui'
import { Sidebar, SidebarContent, useSidebar } from '#/components/base-ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import { MenuItem, useMenu } from '#/context/hooks/use-menu'
import type { UserInfo } from '#/services/types'
import { clx } from '#/utils/helper'
import AppCommand from './app-command'
import UserMenu from './user-menu'

interface AppSidebarProps {
  user: UserInfo
  logout: () => void
}

interface MenuItemProps {
  item: MenuItem
  isActive: boolean
}

const CollapsedMenuItem = ({ item, isActive }: MenuItemProps) => (
  <Tooltip delayDuration={100}>
    <TooltipTrigger asChild>
      <SidebarMenuButton className={clx(isActive && 'bg-accent text-accent-foreground')} asChild>
        <Link href={item.url}>
          <item.icon className={clx(isActive && 'bg-accent text-brand-500')} strokeWidth={1.8} />
          <span>{item.title}</span>
        </Link>
      </SidebarMenuButton>
    </TooltipTrigger>
    <TooltipContent side="right">
      <p>{item.title}</p>
    </TooltipContent>
  </Tooltip>
)

const ExpandedMenuItem = ({ item, isActive }: MenuItemProps) => (
  <SidebarMenuButton className={clx(isActive && 'bg-accent text-accent-foreground')} asChild>
    <Link href={item.url}>
      <item.icon className={clx(isActive && 'bg-accent text-brand-500')} strokeWidth={1.8} />
      <span>{item.title}</span>
    </Link>
  </SidebarMenuButton>
)

export default function AppSidebar({ user, logout }: AppSidebarProps) {
  const { state: sidebarState, toggleSidebar } = useSidebar()
  const { pathname } = useLocation()
  const { menuGroups } = useMenu()

  // Helper to check the active state of the menu
  const isMenuActive = (itemUrl: string): boolean => {
    const specialPaths = ['/settings', '/console', '/content', '/authorization']
    const isSpecialPath = specialPaths.some((path) => itemUrl.startsWith(path))
    return isSpecialPath ? pathname.startsWith(itemUrl) : pathname === itemUrl
  }

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg" className="pointer-events-none select-none">
              <div className="flex aspect-square size-8 items-center justify-center bg-transparent p-0.5">
                <img src="/favicon.svg" className="size-8" alt="logo" />
              </div>
              <div
                className={clx(
                  sidebarState === 'expanded' ? 'flex' : 'hidden',
                  'ml-0.5 flex-col gap-0.5 leading-none'
                )}
              >
                <span className="font-semibold">Squelify</span>
                <span className="text-xs">v{import.meta.env.SQUELIFY_VERSION}</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup
          className={clx(sidebarState === 'expanded' ? 'flex' : 'hidden', 'w-full p-0')}
        >
          <SidebarGroupContent>
            <AppCommand logout={logout} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <TooltipProvider>
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              {!group.hideLabel && (
                <SidebarGroupLabel className="pointer-events-none">{group.label}</SidebarGroupLabel>
              )}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.url}>
                      {sidebarState === 'collapsed' ? (
                        <CollapsedMenuItem item={item} isActive={isMenuActive(item.url)} />
                      ) : (
                        <ExpandedMenuItem item={item} isActive={isMenuActive(item.url)} />
                      )}
                    </SidebarMenuItem>
                  ))}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          ))}
        </TooltipProvider>
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenu
          className={clx(
            sidebarState === 'expanded' ? 'gap-0.5' : 'gap-2',
            'flex flex-col group-data-[state=expanded]:flex-row group-data-[state=expanded]:items-center'
          )}
        >
          <SidebarMenuItem
            className={clx(sidebarState === 'expanded' ? 'order-1' : 'order-2', 'flex-1')}
          >
            <UserMenu user={user} sidebarState={sidebarState} logout={logout} />
          </SidebarMenuItem>
          <SidebarMenuItem
            className={clx(sidebarState === 'expanded' ? 'order-2' : 'order-1', 'h-full w-8')}
          >
            <TooltipProvider>
              <Tooltip delayDuration={100}>
                <TooltipTrigger asChild>
                  <Button
                    data-sidebar="trigger"
                    variant="ghost"
                    size="icon"
                    className={clx(
                      sidebarState === 'expanded' ? 'size-full' : 'size-8',
                      'text-muted-foreground'
                    )}
                    onClick={toggleSidebar}
                  >
                    {sidebarState === 'expanded' ? (
                      <Lucide.ArrowLeftToLine strokeWidth={2} />
                    ) : (
                      <Lucide.ArrowRightToLine strokeWidth={2} />
                    )}
                    <span className="sr-only">Toggle Sidebar</span>
                  </Button>
                </TooltipTrigger>
                <TooltipContent side={sidebarState === 'collapsed' ? 'right' : 'top'}>
                  <p>Toggle Sidebar</p>
                </TooltipContent>
              </Tooltip>
            </TooltipProvider>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
