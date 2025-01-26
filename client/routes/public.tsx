import { lazy } from 'react'
import { Navigate, type RouteObject } from 'react-router'
import NotFound from '#/components/errors/404'
import InternalError from '#/components/errors/500'

// Lazy load the components for better performance
const AuthLayout = lazy(() => import('#/layouts/auth-layout'))
const ForgotPassword = lazy(() => import('#/pages/auth/password/forgot'))
const ResetPassword = lazy(() => import('#/pages/auth/password/reset'))
const SignIn = lazy(() => import('#/pages/auth/login'))
const SignUp = lazy(() => import('#/pages/auth/signup'))
const Setup = lazy(() => import('#/pages/setup/page'))

export const publicRoutes: RouteObject[] = [
  { path: '/', element: <Navigate to="dashboard" replace /> },
  { path: 'setup', element: <Setup /> },
  {
    element: <AuthLayout />,
    children: [
      { path: 'login', element: <SignIn /> },
      { path: 'signup', element: <SignUp /> },
      { path: 'forgot-password', element: <ForgotPassword /> },
      { path: 'reset-password', element: <ResetPassword /> },
    ],
  },
]

export const catchAllRoute: RouteObject = {
  path: '*',
  element: <NotFound />,
  errorElement: <InternalError />,
}
