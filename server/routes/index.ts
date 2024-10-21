import { defineRenderHandler } from 'nitropack/runtime'

export default defineRenderHandler((event) => {
  const appConfig = useAppConfig(event)
  const htmlBody = /* html */ `<!DOCTYPE html>
<html>
  <head>
    <title>Nitro App</title>
    </head>
    <body>
        <h1>Welcome to ${appConfig.title}!</h1>
    </body>
</html>`

  return {
    headers: { 'Content-Type': 'text/html' },
    body: htmlBody,
  }
})
