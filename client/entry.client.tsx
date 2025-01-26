import './styles/fontface.css'
import './styles/globals.css'
import './styles/colors.css'

import { ReactQueryDevtools } from '@tanstack/react-query-devtools'
import consola from 'consola'
import React, { Suspense } from 'react'
import ReactDOM from 'react-dom/client'
import { ErrorBoundary } from 'react-error-boundary'
import { BrowserRouter, useRoutes } from 'react-router'
import appConfig from '~~/app.config'
import pkg from '~~/package.json'
import BoundaryError from '#/components/errors/boundary'
import AppLoader from '#/components/loaders/app-loader'
import AppProvider from '#/context/providers/app-provider'
import TRPCProvider from '#/context/providers/trpc-provider'
import { catchAllRoute, protectedRoutes, publicRoutes } from '#/routes'

if (import.meta.env.PROD) {
  consola.log(
    `%cWelcome to Squelify!%c\n
Does this page need fixes or improvements? ${String.fromCodePoint(0x1f91d)} We like your curiosity!
Help us improve Squelify by joining the team: ${pkg.homepage}
`,
    'padding-top: 0.5em; font-size: 2em;',
    'padding-bottom: 0.5em;'
  )
}

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
        <TRPCProvider>
          <AppProvider defaultTheme="system">
            <Suspense fallback={<AppLoader />}>
              <AppRoutes />
            </Suspense>
            <ReactQueryDevtools position="right" />
          </AppProvider>
        </TRPCProvider>
      </BrowserRouter>
    </ErrorBoundary>
  </React.StrictMode>
)
