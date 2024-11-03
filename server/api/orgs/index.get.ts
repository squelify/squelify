import { z } from 'zod'

export interface IListOrganizationsResponse {
  organizations: Array<{
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    website: string | null
    email: string | null
    phone: string | null
    address: string | null
    status: string
    settings: Record<string, any>
    metadata: Record<string, any>
    isVerified: boolean
    createdAt: string
    updatedAt: string | null
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

const QueryParamSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be greater than 0').default(1),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be greater than 0')
    .max(100, 'Limit must not exceed 100')
    .default(10),
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

      if (!organizations?.length) {
        return createErrorResponse(event, 'No organizations found', 404)
      }

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      const organizationsData = organizations.map((org) => ({
        ...org,
        settings: JSON.parse(org.settings),
        metadata: JSON.parse(org.metadata),
        isVerified: Boolean(org.isVerified),
        createdAt: toISOString(org.createdAt),
        updatedAt: toISOString(org.updatedAt),
      }))

      return createSuccessResponse<IListOrganizationsResponse>(
        event,
        'Organizations retrieved successfully',
        {
          organizations: organizationsData,
          pagination: {
            currentPage: page,
            totalPages,
            totalItems: Number(totalCount?.count || 0),
            itemsPerPage: limit,
          },
        }
      )
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
