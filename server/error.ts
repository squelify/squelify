export default defineNitroErrorHandler((error, event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain')
  return send(event, `[custom error handler] ${error.stack}`)
})
