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
      // Validate query params
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await event.context.db
        .selectFrom('users')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated users
      const users = await event.context.db
        .selectFrom('users')
        .selectAll()
        .limit(limit)
        .offset(offset)
        .execute()

      if (!users) {
        return createErrorResponse(400, 'No user found')
      }

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      return {
        statusCode: 200,
        message: null,
        data: users,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: Number(totalCount?.count || 0),
          itemsPerPage: limit,
        },
      }
    } catch (error) {
      if (error instanceof z.ZodError) {
        return createErrorResponse(400, 'Invalid user input', {
          issues: error.issues.map((issue) => ({
            field: issue.path.join('.'),
            message: issue.message,
          })),
        })
      }
      return throwErrorResponse(error)
    }
  },
  {
    shouldBypassCache: (e) => e.node.req.url.includes('nocache'),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
