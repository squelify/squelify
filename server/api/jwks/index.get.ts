import { z } from 'zod'

export interface IListJWKSResponse {
  jwks: Array<{
    id: string
    keyId: string
    publicKey: string
    algorithm: string
    isActive: boolean
    expiresAt: string
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
    const db = event.context.db

    try {
      // Validate query params
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await db
        .selectFrom('_sq_jwks')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated JWKs
      const jwks = await db
        .selectFrom('_sq_jwks')
        .select([
          'id',
          'keyId',
          'publicKey',
          'algorithm',
          'isActive',
          'expiresAt',
          'createdAt',
          'updatedAt',
        ])
        .limit(limit)
        .offset(offset)
        .orderBy('isActive', 'desc')
        .orderBy('createdAt', 'desc')
        .execute()

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      return createSuccessResponse<IListJWKSResponse>(event, 'JWKs retrieved successfully', {
        jwks: jwks.map((jwk) => ({
          ...jwk,
          isActive: Boolean(jwk.isActive),
          expiresAt: toISOString(jwk.expiresAt),
          createdAt: toISOString(jwk.createdAt),
          updatedAt: toISOString(jwk.updatedAt),
        })),
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
    maxAge: DURATION.HOUR,
  }
)

defineRouteMeta({
  openAPI: {
    summary: 'Get a list of JWKs',
    tags: ['Administration'],
    parameters: [
      {
        in: 'header',
        name: 'Contennt-Type',
        required: true,
        example: 'application/json',
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
