import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '#/context/hooks/use-auth'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import type { AppContextType } from '#/providers/app-provider'
import RootLayout from './root-layout'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { user, roles, logout } = useAuth()

  if (!user) {
    return <Navigate to={`/login?redirect_to=${pathname}`} replace />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout className="size-full min-h-screen">
        <Outlet context={{ user, roles, logout } satisfies AppContextType} />
      </RootLayout>
    </ErrorBoundary>
  )
}
