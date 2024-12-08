import type { FallbackProps } from 'react-error-boundary'

export default function ErrorBoundaryFallback({ error, resetErrorBoundary }: FallbackProps) {
  return (
    <main className="grid h-svh place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="-mt-14 text-center">
        <p className="font-semibold text-base text-brand-600 dark:text-brand-400">
          Something went wrong!
        </p>
        <h1 className="mt-4 font-bold text-3xl text-foreground tracking-tight sm:text-5xl">
          Internal error
        </h1>

        {/* Enhanced Error Details with Custom Scrollbar */}
        <div className="mx-auto mt-6 max-w-2xl rounded-lg border bg-muted/50 p-4 text-left">
          <div className="flex items-center gap-2 text-muted-foreground">
            <span className="font-medium">Error details:</span>
            <span className="text-sm">{error?.name || 'Unknown Error'}</span>
          </div>
          <p className="mt-2 font-mono text-foreground text-sm">
            {error?.message || 'Sorry, it seems our service is experiencing problems.'}
          </p>
          {error?.stack && (
            <pre className="mt-4 max-h-48 overflow-y-auto whitespace-pre-wrap break-words rounded border bg-muted p-4 text-muted-foreground text-sm">
              {error.stack}
            </pre>
          )}
        </div>

        <div className="mt-10 flex items-center justify-center gap-x-6">
          <button
            type="button"
            className="rounded-md bg-brand-600 px-5 py-2.5 font-semibold text-sm text-white shadow-sm hover:bg-brand-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-600 focus-visible:outline-offset-2 dark:bg-brand-500 dark:hover:bg-brand-400"
            onClick={resetErrorBoundary}
          >
            Try again
          </button>
          <a
            href="/docs"
            className="font-semibold text-foreground text-sm hover:text-brand-500 dark:hover:text-brand-400"
            target="_blank"
            rel="noopener noreferrer"
          >
            Read documentation
          </a>
        </div>
      </div>
    </main>
  )
}
