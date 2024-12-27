import { Suspense } from 'react'
import { Navigate, Outlet, useSearchParams } from 'react-router'
import { Card } from '#/components/base-ui'
import PageLoader from '#/components/loaders/page-loader'

export default function AuthLayout() {
  const [searchParams] = useSearchParams()
  const redirectPath = searchParams.get('redirect_to') || '/dashboard'
  const isAuthenticated = false

  if (isAuthenticated) {
    return <Navigate to={redirectPath} replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-50 p-4">
      <div className="w-full max-w-md">
        {/* Card Component */}
        <Card className="p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </Card>
      </div>
    </div>
  )
}
