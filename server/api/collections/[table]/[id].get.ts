import { z } from 'zod'
import { isTableExists } from '~/database/repository/collection.repo'
import { DURATION } from '~/utils/datetime'

export interface ICollectionItemResponse extends Record<string, any> {}

const ParamsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export default defineCachedEventHandler(
  async (event) => {
    const db = event.context.db
    const tableName = getRouterParam(event, 'table')
    const itemId = getRouterParam(event, 'id')

    try {
      // Validate params
      const { id } = ParamsSchema.parse({ id: itemId })

      // Validate table exists
      const exists = await isTableExists(db, tableName)
      if (!exists) {
        return createErrorResponse(event, `Collection '${tableName}' not found`, 404)
      }

      // Get single record
      const record = await db
        .selectFrom(tableName as any)
        .selectAll()
        .where('id', '=', id)
        .executeTakeFirst()

      if (!record) {
        return createErrorResponse(event, `Record with id '${id}' not found`, 404)
      }

      return createSuccessResponse<ICollectionItemResponse>(
        event,
        'Record retrieved successfully',
        record
      )
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: DURATION.HOUR,
  }
)

defineRouteMeta({
  openAPI: {
    summary: 'Get single record from collection',
    description: 'Retrieve a single record by ID from specified collection',
    tags: ['Collections'],
    parameters: [
      {
        in: 'path',
        name: 'table',
        required: true,
        description: 'Table name',
      },
      {
        in: 'path',
        name: 'id',
        required: true,
        description: 'Record ID',
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
