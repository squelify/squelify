import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet } from 'react-router-dom'
import { useAuth } from '#/context/hooks/use-auth'
import RootLayout from '#/layouts/root-layout'
import { ErrorBoundaryFallback } from '#/pages/error/internal-error'
import { clx } from '#/utils/helper'

export default function AuthLayout() {
  const { user } = useAuth()

  if (user) {
    return <Navigate to="/" replace />
  }

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <RootLayout
        className={clx(
          'relative flex size-full min-h-screen flex-1 items-center',
          'bg-gradient-to-bl from-primary-100 via-transparent',
          'dark:from-primary-950 dark:via-transparent'
        )}
      >
        <Outlet />
      </RootLayout>
    </ErrorBoundary>
  )
}
