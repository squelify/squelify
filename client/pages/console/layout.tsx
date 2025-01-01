import { Suspense } from 'react'
import { Outlet } from 'react-router'
import PageLoader from '#/components/loaders/page-loader'

export default function ConsoleLayout() {
  return (
    <Suspense fallback={<PageLoader />}>
      <Outlet />
    </Suspense>
  )
}
