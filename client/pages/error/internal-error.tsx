import { isRouteErrorResponse, useRouteError } from 'react-router'

export default function InternalError() {
  const error = useRouteError()

  if (isRouteErrorResponse(error)) {
    return (
      <main className="grid h-full min-h-screen place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
        <div className="text-center">
          <p className="font-semibold text-base text-brand-600 dark:text-brand-400">
            Oops! {error.status}
          </p>
          <h1 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-5xl">
            {error.statusText}
          </h1>
          {error.data?.message && (
            <div className="mx-auto mt-6 max-w-2xl rounded-lg border bg-muted/50 p-4">
              <p className="font-mono text-muted-foreground text-sm">{error.data.message}</p>
            </div>
          )}
          <div className="mt-10 flex items-center justify-center gap-x-6">
            <button
              type="button"
              className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-sm text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
              onClick={() => window.location.reload()}
            >
              Try again
            </button>
            <a
              href="/"
              className="font-semibold text-foreground text-sm hover:text-brand-500 dark:hover:text-brand-400"
            >
              Back to home
            </a>
          </div>
        </div>
      </main>
    )
  }

  return (
    <main className="grid h-full min-h-screen place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="font-semibold text-base text-brand-600 dark:text-brand-400">
          Something went wrong!
        </p>
        <h1 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-5xl">
          Internal server error
        </h1>
        <div className="mx-auto mt-6 max-w-2xl rounded-lg border bg-muted/50 p-4">
          <p className="font-mono text-muted-foreground text-sm">
            {error instanceof Error ? error.message : 'An unknown error occurred'}
          </p>
        </div>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            type="button"
            className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-sm text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
            onClick={() => window.location.reload()}
          >
            Try again
          </button>
          <a
            href="/"
            className="font-semibold text-foreground text-sm hover:text-brand-500 dark:hover:text-brand-400"
          >
            Back to home
          </a>
        </div>
      </div>
    </main>
  )
}
