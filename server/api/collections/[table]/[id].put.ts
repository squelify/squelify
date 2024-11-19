import { z } from 'zod'
import { isTableExists } from '~/database/repository/collection.repo'

export interface ICollectionItemResponse extends Record<string, any> {}

const ParamsSchema = z.object({
  id: z.string().min(1, 'ID is required'),
})

export default defineEventHandler(async (event) => {
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

    // Get request body
    const body = await readBody(event)

    // Update record
    const updated = await db
      .updateTable(tableName as any)
      .set(body)
      .where('id', '=', id)
      .returning('*')
      .executeTakeFirst()

    if (!updated) {
      return createErrorResponse(event, `Record with id '${id}' not found`, 404)
    }

    return createSuccessResponse<ICollectionItemResponse>(
      event,
      'Record updated successfully',
      updated
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Update record in collection',
    description: 'Update a single record by ID in specified collection',
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
