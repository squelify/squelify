import type { RouteObject } from 'react-router-dom'
import { Navigate, useRoutes } from 'react-router-dom'

import AppLayout from '#/layouts/app-layout'
import AuthLayout from '#/layouts/auth-layout'

import SignInPage from '#/pages/auth/login'
import ForgotPasswordPage from '#/pages/auth/password/forgot'
import ResetPasswordPage from '#/pages/auth/password/reset'
import SignUpPage from '#/pages/auth/signup'
import DashboardPage from '#/pages/dashboard'
import InternalError from '#/pages/error/internal-error'
import NotFound from '#/pages/error/not-found'
import WorkInProgress from '#/pages/work-in-progress'

/**
 * Utility function to create a route object with the provided path and other properties.
 *
 * @param path - The path for the route.
 * @param props - Additional properties for the route object.
 * @returns A new route object with the provided path and properties.
 */
const route = (path: string, { ...props }: RouteObject) => ({ path, ...props })

/**
 * Using dynamic import for the pages to reduce the bundle size.
 *
 * IMPORTANT: Ensure the imported module exports both 'Component' and 'loader'.
 * These exports are required for proper routing and data loading.
 *
 * @see https://reactrouter.com/en/route/lazy#statically-defined-properties
 */
const Routes: RouteObject[] = [
  route('/', {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        element: <DashboardPage />,
        // lazy: () => import('#/pages/dashboard'),
      },

      // User Management
      route('/users', {
        children: [
          { index: true, element: <Navigate to="/users/list" replace /> },
          { path: '/users/list', element: <WorkInProgress /> },
          { path: '/users/roles', element: <WorkInProgress /> },
          { path: '/users/permissions', element: <WorkInProgress /> },
        ],
      }),

      // Content
      route('/content', {
        children: [
          { index: true, element: <Navigate to="/content/collections" replace /> },
          { path: '/content/collections', element: <WorkInProgress /> },
          { path: '/content/media', element: <WorkInProgress /> },
        ],
      }),

      // System
      route('/system', {
        children: [
          { index: true, element: <Navigate to="/system/settings" replace /> },
          { path: '/system/audit-logs', element: <WorkInProgress /> },
          { path: '/system/webhooks', element: <WorkInProgress /> },
          { path: '/system/api-keys', element: <WorkInProgress /> },
          { path: '/system/settings', element: <WorkInProgress /> },
        ],
      }),
    ],
    errorElement: <InternalError />,
  }),
  route('/', {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  }),
  route('*', { element: <NotFound />, errorElement: <InternalError /> }),
]

/**
 * Renders the application's routes using the `useRoutes` hook from `react-router-dom`.
 * This component is responsible for setting up the routing structure and rendering the
 * appropriate components based on the current URL.
 *
 * @example
 *
 * import { BrowserRouter } from 'react-router-dom'
 * import AppRoutes from './routes'
 *
 * export default function App() {
 *   return (
 *     <BrowserRouter>
 *       <AppRoutes />
 *     </BrowserRouter>
 *   )
 * }
 *
 * @returns {JSX.Element} The rendered routes for the application.
 */
const AppRoutes = (): React.ReactElement | null => useRoutes(Routes)

export default AppRoutes
