import './styles/fontface.css'
import './styles/globals.css'

import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter, useRoutes } from 'react-router'
import BoundaryError from '#/components/errors/boundary'
import PageLoader from '#/components/loaders/page-loader'
import AppProvider from '#/context/provider'

import appConfig from '~~/app.config'
import { protectedRoutes } from '#/routes/protected'
import { catchAllRoute, publicRoutes } from '#/routes/public'

// The root element for the app.
const rootElement = document.getElementById('root')

if (!rootElement) {
  throw new Error("Root element not found. Check if it's existss or if the id is correct.")
}

const AppRoutes = () => {
  return useRoutes([...publicRoutes, ...protectedRoutes, catchAllRoute])
}

// When you use Strict Mode, React renders each component twice to help you find unexpected side effects.
// @ref: https://react.dev/blog/2022/03/08/react-18-upgrade-guide#react
ReactDOM.createRoot(rootElement).render(
  <React.StrictMode>
    <ErrorBoundary fallback={<BoundaryError />}>
      <BrowserRouter basename={appConfig.adminPath}>
        <AppProvider defaultTheme="system">
          <Suspense fallback={<PageLoader />}>
            <AppRoutes />
          </Suspense>
        </AppProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
