export default defineEventHandler((event) => {
  const protectedRoutes = ['/api/auth/logout', '/api/users']

  if (protectedRoutes.includes(getRequestURL(event).pathname)) {
    const authCookie = getCookie(event, 'auth_session')
    logger.debug('[app]', 'middleware-auth', authCookie)
    event.context.auth = { authCookie }
  }
})
