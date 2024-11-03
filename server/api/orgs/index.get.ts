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
        .selectFrom('organizations')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated organizations
      const organizations = await event.context.db
        .selectFrom('organizations')
        .selectAll()
        .limit(limit)
        .offset(offset)
        .execute()

      if (!organizations) {
        setResponseStatus(event, 400)
        return createErrorResponse(400, 'No organization found')
      }

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      return {
        status: 200,
        success: true,
        message: null,
        data: organizations.map((org) => ({
          ...org,
          isVerified: Boolean(org.isVerified),
          createdAt: new Date(org.createdAt * 1000).toISOString(),
          updatedAt: toISOString(org.updatedAt),
        })),
        meta: {
          currentPage: page,
          totalPages,
          totalItems: Number(totalCount?.count || 0),
          itemsPerPage: limit,
        },
      }
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
