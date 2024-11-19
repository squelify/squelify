import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router-dom'
import { useAuth } from '#/context/hooks/use-auth'
import RootLayout from '#/layouts/root-layout'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import { clx } from '#/utils/helper'

export default function AuthLayout() {
  const { user } = useAuth()

  const [searchParams] = useSearchParams()
  const redirectTo = searchParams.get('redirect_to') || '/dashboard'

  if (user) {
    return <Navigate to={redirectTo} replace />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout
        className={clx(
          'relative flex size-full min-h-screen flex-1 items-center',
          'bg-gradient-to-bl from-brand-100 via-transparent',
          'dark:from-brand-950 dark:via-transparent'
        )}
      >
        <Outlet />
      </RootLayout>
    </ErrorBoundary>
  )
}
