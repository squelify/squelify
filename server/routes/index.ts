import { defineRenderHandler } from 'nitropack/runtime'
import logger from '~~/core/utils/logger'

export default defineRenderHandler((event) => {
  logger.info('[app]', event.path)

  return {
    body: /* html */ `<!DOCTYPE html>
    <html>
      <head>
        <title>Rendered Page</title>
        </head>
        <body>
            <h1>Rendered by Nitro!</h1>
        </body>
    </html>`,
  }
})
