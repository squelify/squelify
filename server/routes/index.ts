import { defineRenderHandler } from 'nitropack/runtime'

export default defineRenderHandler((event) => {
  logger.info('[app]', event.path)

  return {
    body: /* html */ `<!DOCTYPE html>
  <html>
    <head>
      <title>Nitro App</title>
      </head>
      <body>
          <h1>Welcome to Nitro!</h1>
      </body>
  </html>`,
  }
})
