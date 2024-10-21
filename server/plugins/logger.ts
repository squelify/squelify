import { UAParser } from 'ua-parser-js'

export default defineNitroPlugin(({ hooks }) => {
  hooks.hook('request', (event) => {
    const clientIpAddr = getRequestIP(event, { xForwardedFor: true })

    const userAgent = event.headers.get('User-Agent')
    const uaParser = new UAParser(userAgent)
    const clientOS = `${uaParser.getOS().name} ${uaParser.getOS().version}`
    const browserInfo = `${uaParser.getBrowser().name} ${uaParser.getBrowser().version}`
    const userAgentInfo = `[${clientOS} - ${browserInfo}]`

    logger.info('[app]', event.method, clientIpAddr, event.path, userAgentInfo)
  })

  // hooks.hook('beforeResponse', (event, { body }) => {
  //   logger.info('[app]', 'on response', event.path, body)
  // })

  // hooks.hook('afterResponse', (event, { body }) => {
  //   logger.info('[app]', 'on after response', event.path, body)
  // })

  hooks.hook('error', async (error, { event }) => {
    logger.error('[app]', event.path, error)
  })
})
