import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '#/context/hooks/use-auth'
import type { AppContextType } from '#/context/providers/app-provider'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import RootLayout from './root-layout'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { user, role, logout } = useAuth()

  if (!user) {
    return <Navigate to={`/auth/login?redirect_to=${pathname}`} replace />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout className="size-full min-h-screen">
        <Outlet context={{ user, role, logout } satisfies AppContextType} />
      </RootLayout>
    </ErrorBoundary>
  )
}
