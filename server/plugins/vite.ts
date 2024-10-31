import { process } from 'std-env'
import type { ViteDevServer, Logger as ViteLogger } from 'vite'

export default defineNitroPlugin(async (nitroApp) => {
  if (process.env.NODE_ENV === 'production') {
    return
  }

  const { createServer } = await import('vite')
  const vite = await createServer()
  await vite.listen()

  nitroApp.hooks.hook('request', (event) => {
    event.context.vite = vite
  })
})

declare module 'h3' {
  interface H3EventContext {
    vite?: ViteDevServer
  }
}
