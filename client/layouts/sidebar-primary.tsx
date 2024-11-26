import consola from 'consola'
import { useLocation } from 'react-router'
import { SidebarFooter, SidebarHeader } from '#/components/base-ui/sidebar'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '#/components/base-ui/sidebar'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '#/components/base-ui/sidebar'
import { Sidebar, SidebarContent, useSidebar } from '#/components/base-ui/sidebar'
import { TooltipContent, TooltipProvider } from '#/components/base-ui/tooltip'
import { Tooltip, TooltipTrigger } from '#/components/base-ui/tooltip'
import { Link } from '#/components/link'
import { useMenu } from '#/context/hooks/use-menu'
import type { UserInfo } from '#/services/types'
import { clx } from '#/utils/helper'
import AppCommand from './app-command'
import UserMenu from './user-menu'

interface PrimarySidebarProps {
  user: UserInfo
  logout: () => void
}

export default function PrimarySidebar({ user, logout }: PrimarySidebarProps) {
  const { state: sidebarState } = useSidebar()
  const { pathname } = useLocation()
  const { menuGroups } = useMenu()

  // Helper to check the active state of the menu
  const isMenuActive = (itemUrl: string): boolean => {
    // Untuk settings page, cek apakah path dimulai dengan itemUrl
    if (itemUrl.startsWith('/settings')) {
      return pathname.startsWith(itemUrl)
    }
    // For other menus, exact match
    return pathname === itemUrl
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
              <SidebarGroupLabel
                className={clx(group.hideLabel ? 'hidden' : 'flex', 'pointer-events-none')}
              >
                {group.label}
              </SidebarGroupLabel>
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => (
                    <SidebarMenuItem key={item.title}>
                      {sidebarState === 'collapsed' ? (
                        <Tooltip delayDuration={100}>
                          <TooltipTrigger asChild>
                            <SidebarMenuButton
                              className={clx(
                                isMenuActive(item.url) && 'bg-accent text-accent-foreground'
                              )}
                              asChild
                            >
                              <Link href={item.url}>
                                <item.icon strokeWidth={1.8} />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <SidebarMenuButton
                          className={clx(
                            isMenuActive(item.url) && 'bg-accent text-accent-foreground'
                          )}
                          asChild
                        >
                          <Link href={item.url}>
                            <item.icon strokeWidth={1.8} />
                            <span>{item.title}</span>
                          </Link>
                        </SidebarMenuButton>
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
        <SidebarMenu className="flex flex-col gap-2 group-data-[state=expanded]:flex-row group-data-[state=expanded]:items-center">
          <SidebarMenuItem
            className={clx(sidebarState === 'expanded' ? 'order-1' : 'order-2', 'flex-1')}
          >
            <UserMenu user={user} sidebarState={sidebarState} logout={logout} />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
