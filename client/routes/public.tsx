import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import NotFound from '#/components/errors/404'
import InternalError from '#/components/errors/500'
import { ROUTES } from '#/constants/routes'

// Lazy load the components for better performance
const AuthLayout = lazy(() => import('#/layouts/auth-layout'))
const ForgotPassword = lazy(() => import('#/pages/auth/forgot-password'))
const ResetPassword = lazy(() => import('#/pages/auth/reset-password'))
const SignIn = lazy(() => import('#/pages/auth/signin'))

export const publicRoutes: RouteObject[] = [
  { path: ROUTES.HOME, element: <Navigate to={ROUTES.DASHBOARD} replace /> },
  {
    element: <AuthLayout />,
    children: [
      { path: ROUTES.LOGIN, element: <SignIn /> },
      { path: ROUTES.FORGOT_PASSWORD, element: <ForgotPassword /> },
      { path: ROUTES.RESET_PASSWORD, element: <ResetPassword /> },
    ],
  },
]

export const catchAllRoute: RouteObject = {
  path: '*',
  element: <NotFound />,
  errorElement: <InternalError />,
}
