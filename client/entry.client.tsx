import './styles/globals.css'
// import './styles/installer.css'

import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter, useRoutes } from 'react-router'
import BoundaryError from '#/components/errors/boundary'
import PageLoader from '#/components/loaders/page-loader'
import { AuthProvider } from '#/context/providers/auth-provider'
import { adminRoutes } from '#/routes/admin'
import { protectedRoutes } from '#/routes/protected'
import { catchAllRoute, publicRoutes } from '#/routes/public'

// The root element for the app.
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error("Root element not found. Check if it's existss or if the id is correct.")
}

const AppRoutes = () => {
  return useRoutes([...publicRoutes, ...protectedRoutes, ...adminRoutes, catchAllRoute])
}

// When you use Strict Mode, React renders each component twice to help you find unexpected side effects.
// @ref: https://react.dev/blog/2022/03/08/react-18-upgrade-guide#react
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<BoundaryError />}>
      <BrowserRouter basename="/admin">
        <AuthProvider>
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </AuthProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
