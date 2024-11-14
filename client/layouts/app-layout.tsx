import * as Lucide from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Link } from '#/components/link'
import PageLoader from '#/components/loader'
import { useAuth } from '#/context/hooks/use-auth'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import type { AppContextType } from '#/providers/app-provider'
import RootLayout from './root-layout'

import { SidebarProvider, SidebarTrigger } from './app-sidebar'
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

  // Menu items.
  const menuItems = [
    { title: 'Dashboard', url: '/dashboard', icon: Lucide.Home },
    { title: 'Inbox', url: '#', icon: Lucide.Inbox },
    { title: 'Calendar', url: '#', icon: Lucide.Calendar },
    { title: 'Search', url: '#', icon: Lucide.Search },
    { title: 'Settings', url: '#', icon: Lucide.Settings },
  ]

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout className="size-full min-h-screen">
        <SidebarProvider>
          <Sidebar variant="sidebar" collapsible="icon">
            <SidebarContent>
              <SidebarGroup>
                <SidebarGroupLabel>Application</SidebarGroupLabel>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {menuItems.map((item) => (
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
            </SidebarContent>
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
