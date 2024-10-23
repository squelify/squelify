export default defineCachedEventHandler(
  async (event) => {
    try {
      const userId = event.context.params.id
      const user = await event.context.db
        .selectFrom('users')
        .where('id', '=', userId)
        .selectAll()
        .executeTakeFirst()

      if (!user) {
        return createErrorResponse(400, 'No user found')
      }

      return { status: 200, success: true, message: null, data: user }
    } catch (error) {
      return throwErrorResponse(error)
    }
  },
  {
    shouldBypassCache: (e) => e.node.req.url.includes('nocache'),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
