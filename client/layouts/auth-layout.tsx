import { ErrorBoundary } from 'react-error-boundary'
import { Navigate, Outlet, useLocation, useSearchParams } from 'react-router'
import { ThemeSwitcher } from '#/components/theme-switcher'
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
          'dark:primary/25 bg-gradient-to-bl from-primary/10 via-transparent'
        )}
      >
        <div className="absolute top-2.5 right-2.5 z-10 flex items-center">
          <ThemeSwitcher />
        </div>
        <Outlet />
      </RootLayout>
    </ErrorBoundary>
  )
}
