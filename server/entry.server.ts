import process from 'node:process'
import type { AppConfig } from '~/config'

export default defineEventHandler(async (event) => {
  const appConfig = useAppConfig(event) as AppConfig

  if (process.env.NODE_ENV === 'development') {
    const [serverAddress] = event.context.vite.resolvedUrls.local

    return `<!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${appConfig.title}</title>
      </head>
      <body>
        <div id="root"></div>

        <script type="module">
          import RefreshRuntime from '${serverAddress}@react-refresh'
          RefreshRuntime.injectIntoGlobalHook( window )
          window.$RefreshReg$ = () => { }
          window.$RefreshSig$ = () => ( type ) => type
          window.__vite_plugin_react_preamble_installed__ = true
        </script>

        <!-- scripts for development -->
        <script type="module" src="${serverAddress}@vite/client"></script>
        <script type="module" src="${serverAddress}client/main.tsx"></script>

      </body>
      </html>
    `
  }

  type Manifest = Record<string, { css: string[]; file: string; isEntry: boolean }>

  const manifest = await useStorage('assets:vite').getItem<Manifest>(`manifest.json`)

  if (!manifest) {
    setResponseStatus(event, 500)
    return `Missing manifest`
  }

  const entryChunk = Object.values(manifest).find((entry) => entry.isEntry)
  if (!entryChunk) {
    setResponseStatus(event, 500)
    return `Missing manifest entry`
  }

  const cssLinks = entryChunk.css
    .map((link) => `<link rel="stylesheet" href="/${link}" />`)
    .join('\n')
  const scriptLinks = `<script type="module" src="/${entryChunk.file}"></script>`

  const template = `<!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${appConfig.title}</title>
      ${cssLinks}
      </head>
    <body>
      <div id="root"></div>
      ${scriptLinks}
    </body>
    </html>
  `

  return template
})
