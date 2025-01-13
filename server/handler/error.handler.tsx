import { renderToStaticMarkup } from 'react-dom/server'
import { process } from 'std-env'
import { generateCSRFToken } from '~/utils/string'
import ErrorView from '~/views/error'
import BaseLayout from '~/views/layout'
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

  const html = renderToStaticMarkup(
    <BaseLayout title={appConfig.title} cssLinks={entryChunk.css} csrfToken={csrfToken}>
      <ErrorView appConfig={appConfig} error={error} />
    </BaseLayout>
  )

  setResponseHeader(event, 'Content-Type', 'text/html')
  return send(event, `<!DOCTYPE html>${html}`)
})
