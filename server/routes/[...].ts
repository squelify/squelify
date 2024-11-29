import { H3Error, sendError } from 'h3'
import { env } from 'std-env'
import { handleSPAClient } from '~/handler/spa.handler'
import { handleStaticWeb } from '~/handler/static.handler'

export default defineEventHandler(async (event) => {
  const matchedUrl = event.path.split('?')[0]

  const adminPath = env.SQUELIFY_ADMIN_PATH || '/ui'
  if (matchedUrl.startsWith(adminPath)) {
    return handleSPAClient(event, { entryName: 'main' })
  }

  try {
    return handleStaticWeb(event)
  } catch (error) {
    logger.error('Internal Server Error:', error)
    return sendError(event, new H3Error('Internal Server Error'))
  }
})
