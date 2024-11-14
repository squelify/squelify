import * as Lucide from 'lucide-react'
import { DropdownMenuContent, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { Label } from '#/components/base-ui/label'
import { SidebarInput, SidebarTrigger } from '#/components/base-ui/sidebar'
import { SidebarFooter, SidebarHeader } from '#/components/base-ui/sidebar'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from '#/components/base-ui/sidebar'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '#/components/base-ui/sidebar'
import { Sidebar, SidebarContent, useSidebar } from '#/components/base-ui/sidebar'
import { Link } from '#/components/link'
import { clx } from '#/utils/helper'
import AppCommand from './app-command'

export default function AppSidebar({ logout }: { logout: () => void }) {
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
                  'flex-col gap-0.5 leading-none'
                )}
              >
                <span className="font-semibold">Squelify</span>
                <span className="">v1.0.0</span>
              </div>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>

        <SidebarGroup>
          <SidebarGroupContent className="-mx-0.5">
            <AppCommand logout={logout} />
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarHeader>

      {/* Sidebar Content */}
      <SidebarContent>
        {menuGroups.map((group) => (
          <SidebarGroup key={group.label}>
            <SidebarGroupLabel className={group.label === 'Main' ? 'hidden' : 'flex'}>
              {group.label}
            </SidebarGroupLabel>
            <SidebarGroupContent>
              <SidebarMenu>
                {group.items.map((item) => (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <Link href={item.url}>
                        <item.icon />
                        <span>{item.title}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                ))}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>

      {/* Sidebar Footer */}
      <SidebarFooter>
        <SidebarMenu className="flex flex-col gap-2 transition-all duration-200 ease-linear group-data-[state=expanded]:flex-row group-data-[state=expanded]:items-center">
          <SidebarMenuItem className="flex-1">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <SidebarMenuButton>
                  <Lucide.User2 /> Username
                  <Lucide.ChevronUp className="ml-auto" />
                </SidebarMenuButton>
              </DropdownMenuTrigger>
              <DropdownMenuContent side="top" className="w-[--radix-popper-anchor-width]">
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
