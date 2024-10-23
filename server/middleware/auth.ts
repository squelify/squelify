export default defineEventHandler((event) => {
  const authCookie = getCookie(event, 'auth_session')

  logger.debug('DEBUG:authCookie', authCookie)

  event.context.auth = { authCookie }
})
