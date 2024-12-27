import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import { ROUTES } from '#/constants/routes'

const AppLayout = lazy(() => import('#/layouts/app-layout'))
const Dashboard = lazy(() => import('#/pages/dashboard/page'))

// Account feature group
const Account = {
  Layout: lazy(() => import('#/pages/account/layout')),
  Profile: lazy(() => import('#/pages/account/profile/page')),
}

// Settings feature group
const Settings = {
  Layout: lazy(() => import('#/pages/settings/layout')),
  General: lazy(() => import('#/pages/settings/general/page')),
}

export const protectedRoutes: RouteObject[] = [
  {
    element: <AppLayout />,
    children: [
      { path: ROUTES.DASHBOARD, element: <Dashboard /> },
      {
        element: <Account.Layout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.ACCOUNT.PROFILE} replace /> },
          { path: ROUTES.ACCOUNT.PROFILE, element: <Account.Profile /> },
        ],
      },
      {
        element: <Settings.Layout />,
        children: [
          { index: true, element: <Navigate to={ROUTES.SETTINGS.GENERAL} replace /> },
          { path: ROUTES.SETTINGS.GENERAL, element: <Settings.General /> },
        ],
      },
    ],
  },
]
