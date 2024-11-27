import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Breadcrumb, BreadcrumbList } from '#/components/base-ui/breadcrumb'
import { BreadcrumbItem, BreadcrumbPage } from '#/components/base-ui/breadcrumb'
import { BreadcrumbSeparator } from '#/components/base-ui/breadcrumb'
import { SidebarInset, SidebarProvider } from '#/components/base-ui/sidebar'
import { useAuth } from '#/context/hooks/use-auth'
import { useMenu } from '#/context/hooks/use-menu'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import type { AppContextType } from '#/providers/app-provider'
import { clx, getBreadcrumbItems } from '#/utils/helper'

import React from 'react'
import RootLayout from './root-layout'
import PrimarySidebar from './sidebar-primary'
import SecondarySidebar from './sidebar-secondary'

export default function AppLayout() {
  const { user, logout } = useAuth()
  const { pathname } = useLocation()
  const { menuGroups } = useMenu()

  const redirectTo = encodeURIComponent(pathname)
  const breadcrumbItems = getBreadcrumbItems(pathname, menuGroups)

  if (!user) {
    return <Navigate to={`/login?redirect_to=${redirectTo}`} replace />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout className="size-full min-h-screen">
        <SidebarProvider>
          <PrimarySidebar user={user} logout={logout} />
          {/* <SecondarySidebar /> */}
          <SidebarInset>
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-sidebar px-4">
              <Breadcrumb key={pathname}>
                <BreadcrumbList>
                  {pathname === '/dashboard' && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                  {breadcrumbItems.map((item, index) => (
                    <BreadcrumbItem key={item.url}>
                      {index === breadcrumbItems.length - 1 ? (
                        <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      ) : (
                        <React.Fragment>
                          <BreadcrumbPage>{item.title}</BreadcrumbPage>
                          <BreadcrumbSeparator />
                        </React.Fragment>
                      )}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className="flex flex-1 bg-background">
              <Outlet context={{ user, logout } satisfies AppContextType} />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </RootLayout>
    </ErrorBoundary>
  )
}
