import type { RouteObject } from 'react-router-dom'
import { Navigate, useRoutes } from 'react-router-dom'

import AppLayout from '#/layouts/app-layout'
import AuthLayout from '#/layouts/auth-layout'

import AuditLogsPage from '#/pages/audit-logs/page'
import SignInPage from '#/pages/auth/login'
import ForgotPasswordPage from '#/pages/auth/password/forgot'
import ResetPasswordPage from '#/pages/auth/password/reset'
import SignUpPage from '#/pages/auth/signup'
import DashboardPage from '#/pages/dashboard'
import InternalError from '#/pages/error/internal-error'
import NotFound from '#/pages/error/not-found'

import AccountPage from '#/pages/account/page'
import APIKeysPage from '#/pages/api-keys/page'
import CollectionsPage from '#/pages/collections/page'
import MediaLibraryPage from '#/pages/media-library/page'
import PermissionsPage from '#/pages/permissions/page'
import RolesPage from '#/pages/roles/page'
import SettingsPage from '#/pages/settings/page'
import UsersPage from '#/pages/users/page'
import WebhooksPage from '#/pages/webhooks/page'

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
      { path: '/dashboard', element: <DashboardPage /> },

      // User Management
      route('/users', {
        children: [
          { index: true, element: <Navigate to="/users/list" replace /> },
          { path: '/users/list', element: <UsersPage /> },
          { path: '/users/roles', element: <RolesPage /> },
          { path: '/users/permissions', element: <PermissionsPage /> },
        ],
      }),

      // Content
      route('/content', {
        children: [
          { index: true, element: <Navigate to="/content/collections" replace /> },
          { path: '/content/collections', element: <CollectionsPage /> },
          { path: '/content/media', element: <MediaLibraryPage /> },
        ],
      }),

      // Content
      route('/account', {
        children: [{ index: true, element: <AccountPage /> }],
      }),

      // System
      route('/system', {
        children: [
          { index: true, element: <Navigate to="/system/settings" replace /> },
          { path: '/system/audit-logs', element: <AuditLogsPage /> },
          { path: '/system/webhooks', element: <WebhooksPage /> },
          { path: '/system/api-keys', element: <APIKeysPage /> },
          { path: '/system/settings', element: <SettingsPage /> },
        ],
      }),
    ],
    errorElement: <InternalError />,
  }),
  route('/', {
    element: <AuthLayout />,
    children: [
      { path: '/login', element: <SignInPage /> },
      { path: '/signup', element: <SignUpPage /> },
      { path: '/forgot-password', element: <ForgotPasswordPage /> },
      { path: '/reset-password', element: <ResetPasswordPage /> },
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
