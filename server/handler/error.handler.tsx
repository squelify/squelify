import { renderToStaticMarkup } from 'react-dom/server'
import { process } from 'std-env'
import BaseLayout from '~/resources/layouts/base-layout'
import { generateCSRFToken } from '~/utils/string'
import { useStorage } from '#imports'

type Manifest = Record<string, { css: string[]; file: string; isEntry: boolean }>

export default defineNitroErrorHandler(async (error, event) => {
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

  const entryName = 'entry.client'
  const manifest = await useStorage('assets:vite').getItem<Manifest>(`manifest.json`)

  if (!manifest) {
    setResponseStatus(event, 500)
    return send(event, 'Missing manifest')
  }

  const entryChunk = Object.values(manifest).find(
    (chunk) => chunk.isEntry && chunk.file.includes(entryName)
  )

  if (!entryChunk) {
    setResponseStatus(event, 500)
    return send(event, `Missing ${entryName} entry chunk`)
  }

  // Check existing CSRF token
  let csrfToken = getCookie(event, 'csrf_token')

  // Generate new token if not exists or expired
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    csrfToken = generateCSRFToken()

    setCookie(event, 'csrf_token', csrfToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: event.headers.get('x-forwarded-proto') === 'https',
      maxAge: DURATION.MINUTE * 30,
    })
  }

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

  const html = renderToStaticMarkup(
    <BaseLayout title={appConfig.title} cssLinks={entryChunk.css} csrfToken={csrfToken}>
      <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-white to-gray-100 p-4 dark:from-gray-950 dark:to-gray-900">
        <main className="mx-auto w-full max-w-5xl rounded-xl border-border bg-card px-10 py-12 shadow-sm">
          <div className="space-y-6">
            <div className="space-y-4 text-center">
              <h1 className="bg-gradient-to-r from-brand-500 to-indigo-600 bg-clip-text font-black text-8xl text-transparent">
                {error.statusCode}
              </h1>
              <h2 className="font-bold text-3xl text-foreground">Something went wrong!</h2>
              <p className="mx-auto max-w-xl text-lg text-muted-foreground">
                {error.message ||
                  'The page you are looking for might have been removed or is temporarily unavailable.'}
              </p>
            </div>

            {process.dev ? (
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
                      className="space-y-1"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: []
                      dangerouslySetInnerHTML={{ __html: formatErrorStack(error.stack) }}
                    />
                    {error.cause ? (
                      <div className="mt-4 border-rose-200 border-t pt-4 dark:border-rose-800">
                        <span className="font-semibold text-rose-800 dark:text-rose-300">
                          Cause:
                        </span>
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
                className="inline-flex w-full items-center justify-center rounded-md bg-primary px-5 py-2.5 font-medium text-primary-foreground text-sm shadow transition-all duration-200 hover:shadow-md hover:brightness-90"
              >
                Return Home
              </a>
              <button
                type="button"
                className="inline-flex w-full items-center justify-center rounded-md border border-border bg-muted px-5 py-2.5 font-medium text-muted-foreground text-sm shadow transition-all duration-200 hover:bg-accent hover:shadow-md"
                onClick={() => window.location.reload()}
              >
                Try Again
              </button>
            </div>
          </div>
        </main>
      </div>
    </BaseLayout>
  )

  setResponseHeader(event, 'Content-Type', 'text/html')
  return send(event, `<!DOCTYPE html>${html}`)
})
