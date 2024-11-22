import { process } from 'std-env'
import { generateCSRFToken } from '~/utils/string'
import { useStorage } from '#imports'

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db

  // Check if application is installed by checking existence of admin user
  const isInstalled = await db
    .selectFrom('sq_users as users')
    .innerJoin('sq_user_roles as user_roles', 'user_roles.userId', 'users.id')
    .innerJoin('sq_roles as roles', 'roles.id', 'user_roles.roleId')
    .where('roles.name', '=', 'admin')
    .where('users.isActive', '=', 1)
    .select('users.id')
    .executeTakeFirst()

  // Redirect to installer if not installed, except for installer page and assets
  if (
    !isInstalled &&
    !event.path.startsWith('/installer') &&
    !event.path.startsWith('/favicon.ico') &&
    !event.path.startsWith('/favicon.png') &&
    !event.path.startsWith('/favicon.svg')
  ) {
    return sendRedirect(event, '/installer', 302)
  }

  // Check existing CSRF token
  let csrfToken = getCookie(event, 'csrf_token')

  // Generate new token if not exists or expired
  if (!csrfToken || !validateCSRFToken(csrfToken)) {
    csrfToken = generateCSRFToken()

    // Set CSRF cookie with secure flags
    setCookie(event, 'csrf_token', csrfToken, {
      path: '/',
      httpOnly: true,
      sameSite: 'strict',
      secure: event.headers.get('x-forwarded-proto') === 'https',
      maxAge: DURATION.MINUTE * 30,
    })
  }

  if (process.dev) {
    const [serverAddress] = event.context.vite.resolvedUrls.local

    return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="${csrfToken}">
    <title>${appConfig.title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="${serverAddress}@vite/client"></script>
    <script type="module" src="${serverAddress}client/main.tsx"></script>
  </body>
</html>`
  }

  type Manifest = Record<string, { css: string[]; file: string; isEntry: boolean }>

  const manifest = await useStorage('assets:vite').getItem<Manifest>(`manifest.json`)

  if (!manifest) {
    setResponseStatus(event, 500)
    return 'Missing manifest'
  }

  const entryChunk = Object.values(manifest).find((entry) => entry.isEntry)
  if (!entryChunk) {
    setResponseStatus(event, 500)
    return 'Missing manifest entry'
  }

  const cssLinks = entryChunk.css
    .map((link) => `<link rel="stylesheet" href="/${link}" />`)
    .join('\n')
  const scriptLinks = `<script type="module" src="/${entryChunk.file}"></script>`

  return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <meta name="csrf-token" content="${csrfToken}">
    <title>${appConfig.title}</title>
    ${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    ${scriptLinks}
  </body>
</html>`
})
