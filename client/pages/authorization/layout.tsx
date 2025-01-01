import { Suspense } from 'react'
import { Outlet } from 'react-router'
import PageLoader from '#/components/loaders/page-loader'

export default function AuthzLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  )
}
