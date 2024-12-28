import { isTableExists } from '~/database/repository/collection.repo'

export interface ICollectionItemResponse extends Record<string, any> {}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const tableName = getRouterParam(event, 'table')

  try {
    // Validate table exists
    const exists = await isTableExists(db, tableName)
    if (!exists) {
      return createErrorResponse(event, `Collection '${tableName}' not found`, 404)
    }

    // Get request body
    const body = await readBody(event)

    // Insert record
    const created = await db
      .insertInto(tableName as any)
      .values(body)
      .returning('*')
      .executeTakeFirst()

    return createSuccessResponse<ICollectionItemResponse>(
      event,
      'Record created successfully',
      created
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Create record in table',
    description: 'Create a new record in specified table',
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
