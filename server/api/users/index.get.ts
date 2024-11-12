import { z } from 'zod'

export interface IListUsersResponse {
  users: Array<{
    id: string
    firstName: string
    lastName: string | null
    username: string
    avatarUrl: string | null
    isActive: boolean
    metadata: Record<string, any>
    ban?: {
      reason: string
      expiresAt: string | null
    }
    lastSignInAt: string | null
    createdAt: string
    updatedAt: string | null
    deletedAt: string | null
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
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await db
        .selectFrom('users')
        .where('deletedAt', 'is', null)
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated users with metadata and bans
      const [users, metadata, bans] = await db.transaction().execute(async (trx) => {
        const users = await trx
          .selectFrom('users')
          .where('deletedAt', 'is', null)
          .selectAll()
          .limit(limit)
          .offset(offset)
          .execute()

        const userIds = users.map((u) => u.id)

        const metadataPromise = trx
          .selectFrom('user_metadata')
          .where('userId', 'in', userIds)
          .where('isPublic', '=', 1)
          .select(['userId', 'key', 'value'])
          .execute()

        const bansPromise = trx
          .selectFrom('user_bans')
          .where('userId', 'in', userIds)
          .where((eb) =>
            eb.or([
              eb('expiresAt', '>', Math.floor(Date.now() / 1000)),
              eb('expiresAt', 'is', null),
            ])
          )
          .select(['userId', 'reason', 'expiresAt'])
          .execute()

        const [metadata, bans] = await Promise.all([metadataPromise, bansPromise])
        return [users, metadata, bans]
      })

      if (!users?.length) {
        return createErrorResponse(event, 'No users found', 404)
      }

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      // Group metadata by userId
      const metadataByUser = metadata.reduce((acc, meta) => {
        acc[meta.userId] = acc[meta.userId] || {}
        acc[meta.userId][meta.key] = meta.value
        return acc
      }, {})

      // Group bans by userId
      const bansByUser = bans.reduce((acc, ban) => {
        acc[ban.userId] = {
          reason: ban.reason,
          expiresAt: ban.expiresAt,
        }
        return acc
      }, {})

      const usersData = users.map((user) => ({
        ...user,
        isActive: Boolean(user.isActive),
        metadata: metadataByUser[user.id] || {},
        ban: bansByUser[user.id],
        lastSignInAt: metadataByUser[user.id]?.last_sign_in_at
          ? toISOString(Number(metadataByUser[user.id].last_sign_in_at))
          : null,
        createdAt: toISOString(user.createdAt),
        updatedAt: toISOString(user.updatedAt),
        deletedAt: toISOString(user.deletedAt),
      }))

      return createSuccessResponse<IListUsersResponse>(event, 'Users retrieved successfully', {
        users: usersData,
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
    summary: 'Get list of users',
    tags: ['User Management'],
    parameters: [
      {
        in: 'header',
        name: 'Contennt-Type',
        required: true,
        example: 'application/json',
      },
      {
        in: 'query',
        name: 'nocache',
        required: false,
        example: true,
        allowEmptyValue: true,
        description: 'Disable caching for development purposes',
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
