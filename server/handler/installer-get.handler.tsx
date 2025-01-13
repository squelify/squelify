import { renderToStaticMarkup } from 'react-dom/server'
import { generateCSRFToken } from '~/utils/string'
import InstallerPage from '~/views/installer'
import BaseLayout from '~/views/layout'
import { useStorage } from '#imports'

type Manifest = Record<string, { css: string[]; file: string; isEntry: boolean }>

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const entryName = 'entry.client'

  const manifest = await useStorage('assets:vite').getItem<Manifest>(`manifest.json`)

  if (!manifest) {
    setResponseStatus(event, 500)
    return 'Missing manifest'
  }

  const entryChunk = Object.values(manifest).find(
    (chunk) => chunk.isEntry && chunk.file.includes(entryName)
  )

  if (!entryChunk) {
    setResponseStatus(event, 500)
    return `Missing ${entryName} entry chunk`
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
      <InstallerPage />
    </BaseLayout>
  )

  return `<!DOCTYPE html>${html}`
})
