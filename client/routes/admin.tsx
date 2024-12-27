import { lazy } from 'react'
import { type RouteObject } from 'react-router'
import { ROUTES } from '#/constants/routes'

const AdminLayout = lazy(() => import('#/layouts/admin-layout'))
const AdminDashboard = lazy(() => import('#/pages/admin/dashboard/page'))

export const adminRoutes: RouteObject[] = [
  {
    path: ROUTES.ADMIN.ROOT,
    element: <AdminLayout />,
    children: [{ path: ROUTES.ADMIN.ROOT, element: <AdminDashboard /> }],
  },
]
