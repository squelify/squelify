import { UAParser } from 'ua-parser-js'

function getClientInfo(event) {
  const clientIpAddress = getRequestIP(event, { xForwardedFor: true })
  const clientInfo = event.headers.get('X-Client-Info')
  const userAgent = event.headers.get('User-Agent')

  let clientIdentifier = userAgent

  if (clientInfo) {
    clientIdentifier = clientInfo
  } else if (userAgent) {
    const uaParser = new UAParser(userAgent)
    // Check if browser info exists
    if (uaParser.getBrowser().name) {
      const clientOS = `${uaParser.getOS().name} ${uaParser.getOS().version}`
      const browserInfo = `${uaParser.getBrowser().name} ${uaParser.getBrowser().version}`
      clientIdentifier = `[${clientOS} ${browserInfo}]`
    }
  }

  return { clientIpAddress, clientIdentifier }
}

export default defineNitroPlugin(({ hooks }) => {
  hooks.hook('request', (event) => {
    // Set precise timestamp when request starts
    event.context.requestStartTime = performance.now()

    const { clientIpAddress, clientIdentifier } = getClientInfo(event)
    logger.info('[app][req]', event.method, clientIpAddress, event.path, clientIdentifier)
  })

  hooks.hook('afterResponse', (event) => {
    const { clientIpAddress, clientIdentifier } = getClientInfo(event)
    const endTime = performance.now()
    const startTime = event.context.requestStartTime
    const responseTimeMs = (endTime - startTime).toFixed(2)

    logger.info(
      '[app][res]',
      event.method,
      clientIpAddress,
      event.path,
      clientIdentifier,
      `${responseTimeMs}ms`
    )
  })

  hooks.hook('error', async (error, { event }) => {
    logger.error('[app]', event.path, error)
  })
})
