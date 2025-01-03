import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router'
import { Breadcrumb, BreadcrumbList } from '#/components/base-ui'
import { BreadcrumbItem, BreadcrumbPage } from '#/components/base-ui'
import { BreadcrumbSeparator } from '#/components/base-ui'
import { SidebarInset, SidebarProvider } from '#/components/base-ui'
import { useAuth } from '#/context/hooks/use-auth'
import { useMenu } from '#/context/hooks/use-menu'
import type { AppProviderState } from '#/context/provider'
import { getBreadcrumbItems } from '#/utils/breadcrumb'
import { clx } from '#/utils/helper'

import BoundaryError from '#/components/errors/boundary'
import PageLoader from '#/components/loaders/page-loader'
import RootLayout from './root-layout'
import PrimarySidebar from './sidebar-primary'

// Style constants
const LAYOUT_STYLES = {
  root: 'size-full min-h-screen',
  header: clx('fixed top-0 z-10 flex h-14 w-full items-center gap-2 border-b bg-sidebar px-4'),
  main: clx('h-full flex-1 overflow-y-auto bg-background pt-14'),
} as const

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
      <RootLayout className={LAYOUT_STYLES.root}>
        <SidebarProvider>
          <PrimarySidebar user={user} logout={logout} />
          <SidebarInset>
            <header className={LAYOUT_STYLES.header}>
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
            <main className={LAYOUT_STYLES.main}>
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
