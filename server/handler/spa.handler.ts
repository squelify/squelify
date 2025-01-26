import { type H3Event } from 'h3'
import { process } from 'std-env'
import { DURATION } from '~/utils/datetime'
import { generateCSRFToken } from '~/utils/string'
import pkg from '~~/package.json'
import { useStorage } from '#imports'

interface SPAClientOptions {
  entryName: string
  title?: string
}

type Manifest = Record<string, { css: string[]; file: string; isEntry: boolean }>

export async function handleSPAClient(event: H3Event, options: SPAClientOptions) {
  const { entryName, title } = options
  const db = event.context.db

  // Check if application is installed by checking existence of admin user
  const isInstalled = await db
    .selectFrom('_sq_users as users')
    .innerJoin('_sq_user_roles as user_roles', 'user_roles.userId', 'users.id')
    .innerJoin('_sq_roles as roles', 'roles.id', 'user_roles.roleId')
    .where('roles.name', '=', 'admin')
    .where('users.isActive', '=', 1)
    .select('users.id')
    .executeTakeFirst()

  // Redirect to setup page if not installed
  if (!isInstalled) {
    return sendRedirect(event, '/admin/setup?token=1234567890', 302)
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

  const pageTitle = title ? `${pkg.config.appName} ${title}` : pkg.config.appName

  if (process.dev) {
    // Check Vite server
    if (!event.context.vite) {
      throw new Error('Vite server not initialized')
    }

    // Check resolvedUrls
    if (!event.context.vite.resolvedUrls?.local?.length) {
      throw new Error('Vite server URLs not resolved')
    }

    const [serverAddress] = event.context.vite.resolvedUrls.local

    return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="${csrfToken}" />
    <link rel="manifest" href="/site.webmanifest" />
    <title>${pageTitle}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module">
      window.$RefreshReg$ = () => {}
      window.$RefreshSig$ = () => (type) => type
      window.__vite_plugin_react_preamble_installed__ = true
    </script>
    <script type="module" src="${serverAddress}@vite/client"></script>
    <script type="module" src="${serverAddress}client/${entryName}.tsx"></script>
  </body>
</html>`
  }

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

  const scriptLinks = `<script type="module" src="/${entryChunk.file}"></script>`
  const cssLinks = entryChunk.css
    .map((link) => `<link rel="stylesheet" href="/${link}" />`)
    .join('\n')

  return /* html */ `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="csrf-token" content="${csrfToken}" />
    <link rel="manifest" href="/site.webmanifest" />
    <title>${pageTitle}</title>
    ${cssLinks}
  </head>
  <body>
    <div id="root"></div>
    ${scriptLinks}
  </body>
</html>`
}
