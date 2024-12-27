import { renderToStaticMarkup } from 'react-dom/server'
import { process } from 'std-env'
import ErrorLayout from '~/resources/layouts/error-layout'

export default defineNitroErrorHandler((error, event) => {
  const appConfig = event.context.appConfig
  const isApiDocsRoute = event.path.startsWith('/api-docs') || event.path !== '/api-specs.json'

  if (event.path.startsWith('/api') && !isApiDocsRoute) {
    const errorMessage =
      error.statusCode === 404 ? 'Resource not found' : error.message || 'Internal Server Error'

    const errorIssues = {
      ...(process.dev && {
        issues: error.stack
          ?.split('\n')
          .map((line) => line.trim())
          .filter(Boolean),
      }),
    }

    setResponseHeader(event, 'Content-Type', 'application/json')

    return send(
      event,
      JSON.stringify({
        status: error.statusCode || 500,
        success: false,
        message: errorMessage,
        error: errorIssues,
      })
    )
  }

  const formatErrorStack = (stack?: string) => {
    if (!stack) return ''
    return stack
      .split('\n')
      .map((line) => line.trim())
      .map((line) => {
        if (line.startsWith('at ')) {
          const [context, location] = line.split('(')
          return `<span className="text-rose-500 dark:text-rose-400">${context}</span> <span className="text-rose-400 dark:text-rose-500">${location ? `(${location}` : ''}</span>`
        }
        return `<span className="font-semibold text-rose-600 dark:text-rose-300">${line}</span>`
      })
      .join('<br />')
  }

  const formatCause = (cause: unknown): string => {
    if (!cause) return ''
    if (typeof cause === 'string') return cause
    if (cause instanceof Error) return cause.message
    return JSON.stringify(cause, null, 2)
  }

  const html = renderToStaticMarkup(
    <ErrorLayout title={appConfig.title} csrfToken="xxxxxxxxxxxxxxxxxxxxxxxxx">
      <main className="mx-auto w-full max-w-5xl rounded-xl border border-slate-200 bg-white px-10 py-12 shadow-sm dark:border-slate-800 dark:bg-slate-900">
        <div className="space-y-6">
          <div className="space-y-4 text-center">
            <h1 className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text font-black text-8xl text-transparent">
              {error.statusCode}
            </h1>
            <h2 className="font-bold text-3xl text-slate-900 dark:text-white">
              Something went wrong!
            </h2>
            <p className="mx-auto max-w-xl text-lg text-slate-600 dark:text-slate-400">
              {error.message ||
                'The page you are looking for might have been removed or is temporarily unavailable.'}
            </p>
          </div>

          {process.dev ? (
            <div className="space-y-6">
              <div className="max-h-max overflow-auto rounded-lg border border-rose-200 bg-rose-50 p-6 text-left dark:border-rose-900 dark:bg-rose-900/30">
                <div className="font-mono text-sm leading-relaxed">
                  <div className="mb-2">
                    <span className="font-semibold text-rose-800 dark:text-rose-300">
                      Error Type:
                    </span>
                    <span className="text-rose-700 dark:text-rose-400">{error.name}</span>
                  </div>
                  <div
                    className="space-y-1"
                    // biome-ignore lint/security/noDangerouslySetInnerHtml: []
                    dangerouslySetInnerHTML={{ __html: formatErrorStack(error.stack) }}
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
          ) : null}

          <div className="mx-auto grid max-w-sm grid-cols-2 gap-4">
            <a
              href={appConfig.baseURL}
              className="inline-flex w-full items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 font-medium text-sm text-white shadow transition-all duration-200 hover:bg-blue-700 hover:shadow-md dark:bg-blue-500 dark:hover:bg-blue-600"
            >
              Return Home
            </a>
            <button
              type="button"
              className="inline-flex w-full items-center justify-center rounded-md border border-blue-200 bg-blue-50 px-5 py-2.5 font-medium text-blue-600 text-sm shadow transition-all duration-200 hover:bg-blue-100 hover:shadow-md dark:border-blue-800 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50"
              onClick={() => window.location.reload()}
            >
              Try Again
            </button>
          </div>
        </div>
      </main>
    </ErrorLayout>
  )

  setResponseHeader(event, 'Content-Type', 'text/html')
  return send(event, `<!DOCTYPE html>${html}`)
})
