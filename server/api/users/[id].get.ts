export interface IGetUserResponse {
  user: {
    id: string
    firstName: string
    lastName: string | null
    username: string
    avatarUrl: string | null
    locale: string | null
    isActive: boolean
    isBanned: boolean
    bannedUntil: string | null
    lastSignInAt: string | null
    createdAt: string
    updatedAt: string | null
  }
}

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
        return createErrorResponse(event, 'User not found', 404)
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

      return createSuccessResponse<IGetUserResponse>(event, 'User retrieved successfully', {
        user: userData,
      })
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
