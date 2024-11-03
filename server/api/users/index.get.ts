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
    const db = event.context.db

    try {
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
        setResponseStatus(event, 400)
        return createErrorResponse(400, 'No user found')
      }

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      const usersData = users.map((user) => ({
        ...user,
        isActive: Boolean(user.isActive),
        isBanned: Boolean(user.isBanned),
        bannedUntil: toISOString(user.bannedUntil),
        lastSignInAt: toISOString(user.lastSignInAt),
        createdAt: toISOString(user.createdAt),
        updatedAt: toISOString(user.updatedAt),
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
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)

defineRouteMeta({
  openAPI: {
    summary: 'List users',
    tags: ['User Management'],
    requestBody: {
      content: {},
    },
    security: [
      {
        bearerAuth: [],
      },
    ],
    parameters: [
      {
        name: 'X-Client-Info',
        in: 'header',
        required: true,
        example: 'Scalar',
      },
      {
        name: 'page',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1 },
        example: 1,
      },
      {
        name: 'limit',
        in: 'query',
        required: false,
        schema: { type: 'integer', minimum: 1, maximum: 100 },
        example: 10,
      },
      {
        name: 'nocache',
        in: 'query',
        required: false,
        example: false,
      },
    ],
    responses: {
      200: {
        description: 'OK',
        content: {},
      },
      400: {
        description: 'Bad Request',
        content: {},
      },
      401: {
        description: 'Unauthorized',
        content: {},
      },
    },
  },
})
