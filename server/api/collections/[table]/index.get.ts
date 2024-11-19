import { z } from 'zod'
import { isTableExists } from '~/database/repository/collection.repo'

export interface ICollectionResponse {
  items: Record<string, any>[]
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
    const db = event.context.db
    const tableName = getRouterParam(event, 'table')

    try {
      // Validate table exists
      const exists = await isTableExists(db, tableName)
      if (!exists) {
        return createErrorResponse(event, `Collection '${tableName}' not found`, 404)
      }

      // Parse query params
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await db
        .selectFrom(tableName as any)
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated records
      const records = await db
        .selectFrom(tableName as any)
        .selectAll()
        .limit(limit)
        .offset(offset)
        .execute()

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      return createSuccessResponse<ICollectionResponse>(event, 'Records retrieved successfully', {
        items: records,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: Number(totalCount?.count || 0),
          itemsPerPage: limit,
        },
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
    summary: 'Get records from collection',
    description: 'Retrieve paginated records from specified collection',
    tags: ['Collections'],
    parameters: [
      {
        in: 'path',
        name: 'table',
        required: true,
        description: 'Table name',
      },
      {
        in: 'query',
        name: 'page',
        required: false,
        description: 'Page number (default: 1)',
      },
      {
        in: 'query',
        name: 'limit',
        required: false,
        description: 'Records per page (default: 10, max: 100)',
      },
      {
        in: 'query',
        name: 'nocache',
        required: false,
        description: 'Disable caching for development',
        allowEmptyValue: true,
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      404: { $ref: 'resp-not-found' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
