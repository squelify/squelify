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
      <div className="error-layout">
        <main className="error-main">
          <div className="error-content">
            <div className="error-header">
              <h1 className="error-code">{error.statusCode}</h1>
              <h2 className="error-title">Something went wrong!</h2>
              <p className="error-message">
                {error.message ||
                  'The page you are looking for might have been removed or is temporarily unavailable.'}
              </p>
            </div>

            {process.dev ? (
              <div className="error-stack">
                <div className="error-stack-container">
                  <div className="error-stack-content">
                    <div className="error-type">
                      <span className="error-type-label">Error Type:</span>
                      <span className="error-type-value">{error.name}</span>
                    </div>
                    <div
                      className="space-y-1"
                      // biome-ignore lint/security/noDangerouslySetInnerHtml: []
                      dangerouslySetInnerHTML={{ __html: formatErrorStack(error.stack) }}
                    />
                    {error.cause ? (
                      <div className="error-cause">
                        <span className="error-cause-label">Cause:</span>
                        <pre className="error-cause-value">{formatCause(error.cause)}</pre>
                      </div>
                    ) : null}
                  </div>
                </div>
              </div>
            ) : null}

            <div className="error-actions">
              <a href={appConfig.baseURL} className="error-action-primary">
                Return Home
              </a>
              <button
                type="button"
                className="error-action-secondary"
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
