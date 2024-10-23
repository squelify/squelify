import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '#/context/hooks/use-auth'
import { ErrorBoundaryFallback } from '#/pages/error/internal-error'
import RootLayout from './root-layout'

export default function AppLayout() {
  const { pathname } = useLocation()
  const { user } = useAuth()

  if (!user) {
    return <Navigate to={`/auth/login?redirect_to=${pathname}`} replace />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout className="h-full min-h-screen p-10">
        <Outlet />
      </RootLayout>
    </ErrorBoundary>
  )
}
