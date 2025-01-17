import { Suspense } from 'react'
import { Outlet, useSearchParams } from 'react-router'
import AppLoader from '#/components/loaders/page-loader'
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
      <Suspense fallback={<AppLoader />}>
        <Outlet />
      </Suspense>
    </div>
  )
}
