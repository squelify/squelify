import { DURATION } from '~/utils/datetime'

export interface IGetUserResponse {
  user: {
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
  }
}

export default defineCachedEventHandler(
  async (event) => {
    const db = event.context.db
    const userId = event.context.params.id

    try {
      // Get user data, ban status and metadata in parallel
      const [user, userBan, metadata] = await db.transaction().execute(async (trx) => {
        const userPromise = trx
          .selectFrom('sq_users')
          .where('id', '=', userId)
          .selectAll()
          .executeTakeFirst()

        const banPromise = trx
          .selectFrom('sq_user_bans')
          .where('userId', '=', userId)
          .where((eb) =>
            eb.or([
              eb('expiresAt', '>', Math.floor(Date.now() / 1000)),
              eb('expiresAt', 'is', null),
            ])
          )
          .select(['reason', 'expiresAt'])
          .executeTakeFirst()

        const metadataPromise = trx
          .selectFrom('sq_user_metadata')
          .where('userId', '=', userId)
          .where('isPublic', '=', 1)
          .select(['key', 'value'])
          .execute()

        return Promise.all([userPromise, banPromise, metadataPromise])
      })

      if (!user) {
        return createErrorResponse(event, 'User not found', 404)
      }

      const lastSignInMeta = metadata.find((m) => m.key === 'last_sign_in_at')

      const userData = {
        ...user,
        isActive: Boolean(user.isActive),
        metadata: metadata.reduce((acc, { key, value }) => {
          acc[key] = value
          return acc
        }, {}),
        ban: userBan
          ? {
              reason: userBan.reason,
              expiresAt: toISOString(userBan.expiresAt),
            }
          : undefined,
        lastSignInAt: lastSignInMeta ? toISOString(Number(lastSignInMeta.value)) : null,
        createdAt: toISOString(user.createdAt),
        updatedAt: toISOString(user.updatedAt),
        deletedAt: toISOString(user.deletedAt),
      }

      return createSuccessResponse<IGetUserResponse>(event, 'User retrieved successfully', {
        user: userData,
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
    summary: 'Retrieve user',
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
