import type { EventHandlerRequest, H3Event } from 'h3'

export default defineNitroErrorHandler(
  (error: { message: string; stack: any }, event: H3Event<EventHandlerRequest>) => {
    setResponseHeader(event, 'Content-Type', 'text/plain')

    if (event.path.startsWith('/api')) {
      return { message: error.message }
    }

    return send(event, `[custom error handler] ${error.stack}`)
  }
)
