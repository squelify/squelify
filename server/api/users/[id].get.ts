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
        bannedUntil: user.bannedUntil ? new Date(user.bannedUntil * 1000).toISOString() : null,
        lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt * 1000).toISOString() : null,
        createdAt: new Date(user.createdAt * 1000).toISOString(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt * 1000).toISOString() : null,
      }

      return { status: 200, success: true, message: null, data: userData }
    } catch (error) {
      return throwErrorResponse(error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
