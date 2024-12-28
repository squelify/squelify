import consola from 'consola'
import { H3Error, sendError } from 'h3'
import { handleSPAClient } from '~/handler/spa.handler'
import { handleStaticWeb } from '~/handler/static.handler'
// import { handleTRPC } from '~/handler/trpc.handler'
// import { appRouter, createContext } from '~/trpc'

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const matchedUrl = event.path.split('?')[0]

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

  if (matchedUrl.startsWith(appConfig.adminPath)) {
    return handleSPAClient(event, { entryName: 'entry.client' })
  }

  try {
    // Handle static files from `public_html` directory
    return handleStaticWeb(event)
  } catch (error) {
    consola.error('Internal Server Error:', error)
    return sendError(event, new H3Error('Internal Server Error'))
  }
})
