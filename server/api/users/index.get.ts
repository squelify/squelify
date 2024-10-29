import { z } from 'zod'

// Query params schema
const QueryParamSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be greater than 0'),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be greater than 0')
    .max(100, 'Limit must not exceed 100'),
})

export default defineCachedEventHandler(
  async (event) => {
    try {
      const db = event.context.db

      // Validate query params
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await db
        .selectFrom('users')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated users
      const users = await db.selectFrom('users').selectAll().limit(limit).offset(offset).execute()

      if (!users) {
        return createErrorResponse(400, 'No user found')
      }

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      const usersData = users.map((user) => ({
        ...user,
        isActive: Boolean(user.isActive),
        isBanned: Boolean(user.isBanned),
        bannedUntil: user.bannedUntil ? new Date(user.bannedUntil * 1000).toISOString() : null,
        lastSignInAt: user.lastSignInAt ? new Date(user.lastSignInAt * 1000).toISOString() : null,
        createdAt: new Date(user.createdAt * 1000).toISOString(),
        updatedAt: user.updatedAt ? new Date(user.updatedAt * 1000).toISOString() : null,
      }))

      return {
        status: 200,
        success: true,
        message: null,
        data: usersData,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: Number(totalCount?.count || 0),
          itemsPerPage: limit,
        },
      }
    } catch (error) {
      return throwErrorResponse(error)
    }
  },
  {
    shouldBypassCache: (e) => e.node.req.url.includes('nocache'),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
