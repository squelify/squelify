import { Suspense } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router'
import PageLoader from '#/components/loaders/page-loader'
import { useAuth } from '#/context/hooks/use-auth'

export default function AdminLayout() {
  const { user, isLoading } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <PageLoader />
  }

  if (!user || user.role !== 'admin') {
    return <Navigate to="/dashboard" state={{ from: location }} replace />
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
      <div className="w-full max-w-md">
        {/* Card Component */}
        <div className="bg-white p-8">
          <Suspense fallback={<PageLoader />}>
            <Outlet />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
