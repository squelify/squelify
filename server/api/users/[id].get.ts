export default defineCachedEventHandler(
  async (event) => {
    const db = event.context.db
    const userId = event.context.params.id

    try {
      const user = await db
        .selectFrom('users')
        .where('id', '=', userId)
        .selectAll()
        .executeTakeFirst()

      if (!user) {
        setResponseStatus(event, 400)
        return createErrorResponse(400, 'No user found')
      }

      const userData = {
        ...user,
        isActive: Boolean(user.isActive),
        isBanned: Boolean(user.isBanned),
        bannedUntil: toISOString(user.bannedUntil),
        lastSignInAt: toISOString(user.lastSignInAt),
        createdAt: toISOString(user.createdAt),
        updatedAt: toISOString(user.updatedAt),
      }

      return { status: 200, success: true, message: null, data: userData }
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)

defineRouteMeta({
  openAPI: {
    summary: 'Get a user',
    tags: ['User Management'],
  },
})
