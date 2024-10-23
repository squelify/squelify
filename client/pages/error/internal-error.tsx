import type React from 'react'
import type { FallbackProps } from 'react-error-boundary'
import { isRouteErrorResponse, useRouteError } from 'react-router-dom'

interface ErrorScreenProps {
  message: string
  handler: () => void
}

export function InternalError() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <div>
        <h1>Oops!</h1>
        <h2>{error.status}</h2>
        <p>{error.statusText}</p>
        {error.data?.message && <p>{error.data.message}</p>}
      </div>
    )
  }

  return (
    <ErrorScreen
      message={error instanceof Error ? error.message : 'An unknown error occurred'}
      handler={() => window.location.reload()}
    />
  )
}

export function ErrorBoundaryFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <ErrorScreen
      message={error?.message || 'Sorry, it seems our service is experiencing problems.'}
      // Call resetErrorBoundary() to reset the error boundary and retry the render.
      handler={resetErrorBoundary}
    />
  )
}

const ErrorScreen: React.FC<ErrorScreenProps> = ({ message, handler }) => {
  return (
    <main className="grid h-full min-h-screen place-items-center bg-white px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-base text-primary-600">Something went wrong!</p>
        <h1 className="mt-4 font-bold text-3xl text-neutral-900 tracking-tight sm:text-5xl">
          Internal server error
        </h1>
        <p className="mt-6 text-base leading-7">{message}</p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            type="button"
            className="rounded-md bg-primary-600 px-5 py-2.5 font-semibold text-sm text-white shadow-sm hover:bg-primary-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-primary-600 focus-visible:outline-offset-2"
            onClick={handler}
          >
            Try again
          </button>
          <a
            href="https://example.com"
            className="font-semibold text-neutral-900 text-sm"
            target="_blank"
            rel="noreferrer"
          >
            Service Status <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  )
}
