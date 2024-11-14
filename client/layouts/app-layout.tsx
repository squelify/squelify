import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { SidebarInset, SidebarProvider } from '#/components/base-ui/sidebar'
import PageLoader from '#/components/loader'
import { useAuth } from '#/context/hooks/use-auth'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import type { AppContextType } from '#/providers/app-provider'

import AppSidebar from './app-sidebar'
import RootLayout from './root-layout'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { user, logout, isInitialized } = useAuth()

  if (!isInitialized) {
    return <PageLoader />
  }

  if (!user) {
    return <Navigate to={`/login?redirect_to=${encodeURIComponent(pathname)}`} replace />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout className="size-full min-h-screen">
        <SidebarProvider>
          <AppSidebar logout={logout} />
          <SidebarInset>
            {/* <header className="flex h-16 shrink-0 items-center gap-2 border-b px-4">
              <SidebarTrigger className="-ml-1" />
              <Separator orientation="vertical" className="mr-2 h-4" />
              <Breadcrumb>
                <BreadcrumbList>
                  <BreadcrumbItem className="hidden md:block">
                    <BreadcrumbLink href="#">Building Your Application</BreadcrumbLink>
                  </BreadcrumbItem>
                  <BreadcrumbSeparator className="hidden md:block" />
                  <BreadcrumbItem>
                    <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                  </BreadcrumbItem>
                </BreadcrumbList>
              </Breadcrumb>
            </header> */}
            <main className="flex flex-1 bg-gray-100/80">
              <Outlet context={{ user, logout } satisfies AppContextType} />
            </main>
          </SidebarInset>
        </SidebarProvider>
      </RootLayout>
    </ErrorBoundary>
  )
}
