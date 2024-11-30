import { H3Error, sendError } from 'h3'
import { handleSPAClient } from '~/handler/spa.handler'
import { handleStaticWeb } from '~/handler/static.handler'
import { handleTRPC } from '~/handler/trpc.handler'
import { appRouter } from '~/trpc'
import { createContext } from '~/trpc/trpc'

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const matchedUrl = event.path.split('?')[0]

  if (matchedUrl.startsWith('/trpc/')) {
    return handleTRPC(event, {
      router: appRouter,
      createContext,
    })
  }

  if (matchedUrl.startsWith(appConfig.adminPath)) {
    return handleSPAClient(event, { entryName: 'main' })
  }

  try {
    return handleStaticWeb(event)
  } catch (error) {
    logger.error('Internal Server Error:', error)
    return sendError(event, new H3Error('Internal Server Error'))
  }
})
