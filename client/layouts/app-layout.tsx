import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Breadcrumb, BreadcrumbLink, BreadcrumbList } from '#/components/base-ui/breadcrumb'
import { BreadcrumbItem, BreadcrumbPage } from '#/components/base-ui/breadcrumb'
import { BreadcrumbSeparator } from '#/components/base-ui/breadcrumb'
import { Separator } from '#/components/base-ui/separator'
import { SidebarInset, SidebarProvider, SidebarTrigger } from '#/components/base-ui/sidebar'
import { Link } from '#/components/link'
import PageLoader from '#/components/loader'
import { useAuth } from '#/context/hooks/use-auth'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import type { AppContextType } from '#/providers/app-provider'

import RootLayout from './root-layout'
import PrimarySidebar from './sidebar-primary'
import SecondarySidebar from './sidebar-secondary'

export default function AppLayout() {
  const { user, logout, isInitialized } = useAuth()

  const { pathname } = useLocation()
  const redirectTo = encodeURIComponent(pathname)

  if (!isInitialized) {
    return <PageLoader />
  }

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
            <header className="sticky top-0 z-10 flex h-14 shrink-0 items-center gap-2 border-b bg-background px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Overview</BreadcrumbPage>
                  </BreadcrumbItem>
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
