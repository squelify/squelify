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
    const statusCode = `[${event.node.res.statusCode}]`

    logger.info(
      '[app][res]',
      event.method,
      clientIpAddress,
      event.path,
      clientIdentifier,
      statusCode,
      `${responseTimeMs}ms`
    )
  })

  hooks.hook('error', async (error, { event }) => {
    logger.error('[app]', event.path, error)
  })
})
