import * as Lucide from 'lucide-react'
import { useLocation } from 'react-router-dom'
import { DropdownMenuContent, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { SidebarFooter, SidebarHeader, SidebarTrigger } from '#/components/base-ui/sidebar'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '#/components/base-ui/sidebar'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '#/components/base-ui/sidebar'
import { Sidebar, SidebarContent, useSidebar } from '#/components/base-ui/sidebar'
import { TooltipContent, TooltipProvider } from '#/components/base-ui/tooltip'
import { Tooltip, TooltipTrigger } from '#/components/base-ui/tooltip'
import { Link } from '#/components/link'
import { clx } from '#/utils/helper'
import AppCommand from './app-command'

export default function AppSidebar({ logout }: { logout: () => void }) {
  const { pathname } = useLocation()
  const { state: sidebarState } = useSidebar()

  const menuGroups = [
    {
      label: 'Main',
      items: [{ title: 'Dashboard', url: '/dashboard', icon: Lucide.Home }],
    },
    {
      label: 'User Management',
      items: [
        { title: 'Users', url: '/users/list', icon: Lucide.Users },
        { title: 'Roles', url: '/users/roles', icon: Lucide.Shield },
        { title: 'Permissions', url: '/users/permissions', icon: Lucide.Lock },
      ],
    },
    {
      label: 'Content',
      items: [
        { title: 'Collections', url: '/content/collections', icon: Lucide.Database },
        { title: 'Media Library', url: '/content/media', icon: Lucide.Image },
      ],
    },
    {
      label: 'System',
      items: [
        { title: 'Audit Logs', url: '/system/audit-logs', icon: Lucide.ScrollText },
        { title: 'Webhooks', url: '/system/webhooks', icon: Lucide.Webhook },
        { title: 'API Keys', url: '/system/api-keys', icon: Lucide.Key },
        { title: 'Settings', url: '/system/settings', icon: Lucide.Settings2 },
      ],
    },
  ]

  return (
    <Sidebar variant="sidebar" collapsible="icon">
      {/* Sidebar Header */}
      <SidebarHeader>
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton size="lg">
              <div className="flex aspect-square size-8 items-center justify-center rounded-lg bg-sidebar-primary text-sidebar-primary-foreground">
                <Lucide.GalleryVerticalEnd className="size-4" />
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

        <SidebarGroup className={clx(sidebarState === 'expanded' ? 'flex' : 'hidden')}>
          <SidebarGroupContent className="-mx-0.5">
            <AppCommand logout={logout} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        <TooltipProvider>
          {menuGroups.map((group) => (
            <SidebarGroup key={group.label}>
              <SidebarGroupLabel className={group.label === 'Main' ? 'hidden' : 'flex'}>
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
                                pathname === item.url && 'bg-accent text-accent-foreground'
                              )}
                              asChild
                            >
                              <Link href={item.url}>
                                <item.icon />
                                <span>{item.title}</span>
                              </Link>
                            </SidebarMenuButton>
                          </TooltipTrigger>
                          <TooltipContent side="right" className="rounded-lg bg-black">
                            <p>{item.title}</p>
                          </TooltipContent>
                        </Tooltip>
                      ) : (
                        <SidebarMenuButton
                          className={clx(
                            pathname === item.url && 'bg-accent text-accent-foreground'
                          )}
                          asChild
                        >
                          <Link href={item.url}>
                            <item.icon />
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
          <SidebarMenuItem className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Lucide.User2 /> Username
                  <Lucide.ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                side={sidebarState === 'expanded' ? 'top' : 'right'}
                className="w-[--radix-popper-anchor-width]"
              >
                <DropdownMenuItem>
                  <span>Account</span>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <span>Billing</span>
                </DropdownMenuItem>
                <DropdownMenuItem onClick={logout}>
                  <span>Sign out</span>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </SidebarMenuItem>
          <SidebarMenuItem>
            <SidebarTrigger />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}
