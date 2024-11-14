import * as Lucide from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Link } from '#/components/link'
import PageLoader from '#/components/loader'
import { useAuth } from '#/context/hooks/use-auth'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import type { AppContextType } from '#/providers/app-provider'
import RootLayout from './root-layout'

import { DropdownMenuContent, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { SidebarFooter, SidebarHeader, SidebarProvider, SidebarTrigger } from './app-sidebar'
import { SidebarGroup, SidebarGroupContent, SidebarGroupLabel } from './app-sidebar'
import { SidebarMenu, SidebarMenuButton, SidebarMenuItem } from './app-sidebar'
import { Sidebar, SidebarContent } from './app-sidebar'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { user, logout, isInitialized } = useAuth()

  if (!isInitialized) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to={`/login?redirect_to=${encodeURIComponent(pathname)}`} replace />
  }

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
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout className="size-full min-h-screen">
        <SidebarProvider>
          <Sidebar variant="sidebar" collapsible="icon">
            {/* Sidebar Header */}
            <SidebarHeader>
              <SidebarMenu>
                <SidebarMenuItem>
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <SidebarMenuButton>
                        <span>Select Workspace</span>
                        <Lucide.ChevronDown className="ml-auto" />
                      </SidebarMenuButton>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-[--radix-popper-anchor-width]">
                      <DropdownMenuItem>
                        <span>Acme Inc</span>
                      </DropdownMenuItem>
                      <DropdownMenuItem>
                        <span>Acme Corp.</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarHeader>

            {/* Sidebar Content */}
            <SidebarContent>
              {menuGroups.map((group) => (
                <SidebarGroup key={group.label}>
                  <SidebarGroupLabel>{group.label}</SidebarGroupLabel>
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
              <SidebarMenu>
                <SidebarMenuItem>
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
                      <DropdownMenuItem>
                        <span>Sign out</span>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </SidebarMenuItem>
              </SidebarMenu>
            </SidebarFooter>
          </Sidebar>
          <main className="flex flex-1 flex-col bg-white">
            <SidebarTrigger />
            <Outlet context={{ user, logout } satisfies AppContextType} />
          </main>
        </SidebarProvider>
      </RootLayout>
    </ErrorBoundary>
  )
}
