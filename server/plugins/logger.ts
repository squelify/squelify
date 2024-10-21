export default defineNitroPlugin(({ hooks }) => {
  hooks.hook('request', (event) => {
    const clientIpAddr = event.headers.get('X-Forwarded-For')
    logger.info('[app]', 'on request', event.path, clientIpAddr)
  })

  hooks.hook('beforeResponse', (event, { body }) => {
    logger.info('[app]', 'on response', event.path, body)
  })

  hooks.hook('afterResponse', (event, { body }) => {
    logger.info('[app]', 'on after response', event.path, body)
  })
})
