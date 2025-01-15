import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Breadcrumb, BreadcrumbList } from '#/components/base-ui'
import { BreadcrumbItem, BreadcrumbPage } from '#/components/base-ui'
import { BreadcrumbSeparator } from '#/components/base-ui'
import { SidebarInset, SidebarProvider } from '#/components/base-ui'
import { useAuth } from '#/context/hooks/use-auth'
import { useMenu } from '#/context/hooks/use-menu'
import type { AppProviderState } from '#/context/providers/app-provider'
import { getBreadcrumbItems } from '#/utils/breadcrumb'
import { clx } from '#/utils/helper'

import BoundaryError from '#/components/errors/boundary'
import PageLoader from '#/components/loaders/page-loader'
import AppSidebar from './app-sidebar'
import RootLayout from './root-layout'

type OutletContext = Pick<AppProviderState['auth'], 'user' | 'logout'>

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
    <ErrorBoundary FallbackComponent={BoundaryError}>
      <RootLayout className="size-full min-h-screen">
        <SidebarProvider>
          <AppSidebar user={user} logout={logout} />
          <SidebarInset>
            <header
              className={clx(
                'fixed top-0 z-10 flex h-14 w-full items-center gap-2 border-b bg-sidebar px-4'
              )}
            >
              <Breadcrumb key={pathname}>
                <BreadcrumbList>
                  {pathname === '/dashboard' && (
                    <BreadcrumbItem>
                      <BreadcrumbPage>Dashboard</BreadcrumbPage>
                    </BreadcrumbItem>
                  )}
                  {breadcrumbItems.map((item, index) => (
                    <BreadcrumbItem key={item.url}>
                      <BreadcrumbPage>{item.title}</BreadcrumbPage>
                      {index < breadcrumbItems.length - 1 && <BreadcrumbSeparator />}
                    </BreadcrumbItem>
                  ))}
                </BreadcrumbList>
              </Breadcrumb>
            </header>
            <main className={clx('h-full flex-1 overflow-y-auto bg-background pt-14')}>
              <Suspense fallback={<PageLoader />}>
                <Outlet context={{ user, logout } satisfies OutletContext} />
              </Suspense>
            </main>
          </SidebarInset>
        </SidebarProvider>
      </RootLayout>
    </ErrorBoundary>
  )
}
