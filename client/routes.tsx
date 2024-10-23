import type { RouteObject } from 'react-router-dom'
import { Navigate, createBrowserRouter, useRoutes } from 'react-router-dom'

// Application layouts
import AppLayout from '#/layouts/app-layout'
import AuthLayout from '#/layouts/auth-layout'

// Authentication pages
import ForgotPasswordPage from '#/pages/auth/forgot-password'
import SignInPage from '#/pages/auth/login'
import SignUpPage from '#/pages/auth/register'
import ResetPasswordPage from '#/pages/auth/reset-password'
import InternalError from '#/pages/error/internal-error'
import NotFound from '#/pages/error/not-found'

/**
 * Utility function to create a route object with the provided path and other properties.
 *
 * @param path - The path for the route.
 * @param props - Additional properties for the route object.
 * @returns A new route object with the provided path and properties.
 */
const Route = (path: string, { ...props }: RouteObject) => ({ path, ...props })

/**
 * Using dynamic import for the pages to reduce the bundle size.
 *
 * IMPORTANT: Ensure the imported module exports both 'Component' and 'loader'.
 * These exports are required for proper routing and data loading.
 *
 * @see https://reactrouter.com/en/route/lazy#statically-defined-properties
 */
const Routes: RouteObject[] = [
  Route('/', {
    element: <AppLayout />,
    children: [
      { index: true, element: <Navigate to="/dashboard" replace /> },
      {
        path: 'dashboard',
        lazy: () =>
          import('#/pages/dashboard').then((module) => ({
            Component: module.Component,
            loader: module.Loader,
          })),
      },
    ],
    errorElement: <InternalError />,
  }),
  Route('/auth', {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <SignInPage /> },
      { path: 'signup', element: <SignUpPage /> },
      { path: 'forgot-password', element: <ForgotPasswordPage /> },
      { path: 'reset-password', element: <ResetPasswordPage /> },
    ],
  }),
  Route('*', { element: <NotFound />, errorElement: <InternalError /> }),
]

/**
 * Creates a browser-based router instance using the provided `routes` configuration.
 * This router instance can be used with the `RouterProvider` component to render the application's routes.
 *
 * @example
 *
 * import { RouterProvider } from 'react-router-dom'
 * import { Route, BrowserRoutes } from './routes'
 *
 * const App = () => {
 *   return <RouterProvider router={BrowserRoutes} />
 * }
 *
 */
const BrowserRoutes = createBrowserRouter(Routes)

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

export { Routes, BrowserRoutes }

export default AppRoutes
