import { H3Error } from 'h3'
import { AppConfig } from '~~/app.config'
import { errorStyles } from './error.css'

interface ErrorViewProps {
  appConfig: AppConfig
  error: H3Error
}

export default function ErrorView({ appConfig, error }: ErrorViewProps) {
  const styles = errorStyles()

  const formatErrorStack = (stack?: string) => {
    if (!stack) return ''
    return stack
      .split('\n')
      .map((line) => line.trim())
      .map((line) => {
        if (line.startsWith('at ')) {
          const [context, location] = line.split('(')
          return `<span class="text-destructive/90">${context}</span> <span class="text-destructive/80">${location ? `(${location}` : ''}</span>`
        }
        return `<span class="font-semibold text-destructive">${line}</span>`
      })
      .join('<br />')
  }

  const formatCause = (cause: unknown): string => {
    if (!cause) return ''
    if (typeof cause === 'string') return cause
    if (cause instanceof Error) return cause.message
    return JSON.stringify(cause, null, 2)
  }

  if (process.dev) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto w-full max-w-5xl rounded-xl border-border bg-card px-10 py-12 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <h1 className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text font-black text-8xl text-transparent">
                {error.statusCode}
              </h1>
              <h2 className="font-bold text-3xl text-foreground">Something went wrong!</h2>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                {error.message ||
                  'The page you are looking for might have been removed or is temporarily unavailable.'}
              </p>
            </div>

            <div className="space-y-6">
              <div className="max-h-max overflow-auto rounded-lg border-rose-200 bg-rose-50 p-6 text-left dark:border-rose-900 dark:bg-rose-900/30">
                <div className="font-mono text-sm leading-relaxed">
                  <div className="mb-2">
                    <span className="font-semibold text-rose-800 dark:text-rose-300">
                      Error Type:
                    </span>
                    <span className="text-rose-700 dark:text-rose-400">{error.name}</span>
                  </div>
                  <div
                    dangerouslySetInnerHTML={{ __html: formatErrorStack(error.stack) }}
                    className="space-y-1"
                  />
                  {error.cause ? (
                    <div className="mt-4 border-rose-200 border-t pt-4 dark:border-rose-800">
                      <span className="font-semibold text-rose-800 dark:text-rose-300">Cause:</span>
                      <pre className="mt-2 whitespace-pre-wrap text-rose-700 dark:text-rose-400">
                        {formatCause(error.cause)}
                      </pre>
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
              <a
                href={appConfig.baseURL}
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground text-sm shadow-sm transition-all duration-200 hover:shadow-md hover:brightness-90"
              >
                Return Home
              </a>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-md border border-border bg-muted px-5 py-2.5 font-medium text-muted-foreground text-sm shadow-sm transition-all duration-200 hover:bg-accent hover:shadow-md"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    )
  }

  return (
    <div className={styles.wrapper()}>
      <div className={styles.decorativeGradient()}>
        <div className={styles.gradientInner()}>
          <div className={styles.gradientBg()} />
        </div>
      </div>
      <div className={styles.decorativeCode()}>
        <h2 className={styles.decorativeText()}>{error.statusCode}</h2>
      </div>
      <div className={styles.content()}>
        <div className={styles.container()}>
          <p className={styles.errorCode()}>{error.statusCode}</p>
          <h1 className={styles.title()}>Something went wrong!</h1>
          <p className={styles.description()}>
            {error instanceof Error
              ? error.message
              : 'Something went wrong on our end. Please try again later.'}
          </p>
          <div className={styles.actions()}>
            <button
              type="button"
              className={styles.primaryButton()}
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
            <a
              href="https://squelify.com/docs/troubleshooting"
              className={styles.secondaryButton()}
              rel="noopener noreferrer"
              target="_blank"
            >
              Troubleshooting Guide
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
