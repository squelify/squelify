import { Suspense } from 'react'
import { Outlet, useSearchParams } from 'react-router'
import PageLoader from '#/components/loaders/page-loader'
import { ThemeSwitcher } from '#/components/theme'
import { useAuth } from '#/context/hooks/use-auth'
import { clx } from '#/utils/helper'

export default function AuthLayout() {
  const { user } = useAuth()

  console.debug('DEBUG:user', user)

  const [searchParams] = useSearchParams()
  const _redirectTo = searchParams.get('redirect_to') || '/dashboard'

  // if (user) {
  //   return <Navigate to={redirectTo} replace />
  // }

  return (
    <div
      className={clx(
        'relative flex size-full min-h-screen flex-1 items-center',
        'dark:primary/25 bg-gradient-to-bl from-primary/10 via-transparent'
      )}
    >
      <div className="absolute top-3 right-3 z-10 flex items-center">
        <ThemeSwitcher />
      </div>
      <Suspense fallback={<PageLoader />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
