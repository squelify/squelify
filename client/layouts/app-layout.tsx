import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { SidebarProvider } from '#/components/base-ui/sidebar'
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
          <main className="flex flex-1 flex-col bg-gray-50">
            <Outlet context={{ user, logout } satisfies AppContextType} />
          </main>
        </SidebarProvider>
      </RootLayout>
    </ErrorBoundary>
  )
}
