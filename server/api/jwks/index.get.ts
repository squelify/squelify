import { z } from 'zod'

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
        .selectFrom('jwks')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated JWKs
      const jwks = await db
        .selectFrom('jwks')
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

      const jwksData = jwks.map((jwk) => ({
        id: jwk.id,
        keyId: jwk.keyId,
        publicKey: jwk.publicKey,
        algorithm: jwk.algorithm,
        isActive: Boolean(jwk.isActive),
        expiresAt: toISOString(jwk.expiresAt),
        createdAt: toISOString(jwk.createdAt),
        updatedAt: toISOString(jwk.updatedAt),
      }))

      return {
        status: 200,
        success: true,
        message: null,
        data: jwksData,
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
