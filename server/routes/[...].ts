import consola from 'consola'
import { H3Error, sendError } from 'h3'
import { handleSPAClient } from '~/handler/spa.handler'
// import { handleTRPC } from '~/handler/trpc.handler'
// import { appRouter, createContext } from '~/trpc'

export default defineEventHandler(async (event) => {
  const matchedUrl = event.path.split('?')[0]

  try {
    // Let API routes flow naturally
    if (matchedUrl.startsWith('/api')) {
      const statusCode = event.node.res.statusCode
      if (statusCode && statusCode === 404) {
        return sendError(
          event,
          createError({
            statusCode,
            statusMessage: 'Resource not found',
            data: {
              path: matchedUrl,
              message: `Endpoint ${matchedUrl} does not exist`,
            },
          })
        )
      }

      return sendError(
        event,
        createError({
          statusCode,
          statusMessage: 'API Error',
          data: {
            path: matchedUrl,
            message: `An error occurred while processing request to ${matchedUrl}`,
          },
        })
      )
    }

    // FIXME: `Cannot access '_____$1' before initialization`
    // if (matchedUrl.startsWith('/trpc/')) {
    //   return handleTRPC(event, {
    //     router: appRouter,
    //     createContext,
    //   })
    // }

    // Otherwise, let the SPA handle the request
    return handleSPAClient(event, { entryName: 'entry.client' })
  } catch (error) {
    consola.error('Internal Server Error:', error)
    return sendError(event, new H3Error('Internal Server Error'))
  }
})
