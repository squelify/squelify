import { typeid } from 'typeid-js'
import { UserSchema } from '~/database/schemas/user'

export interface IUpdateUserResponse {
  user: {
    id: string
    firstName: string
    lastName: string | null
    username: string
    avatarUrl: string | null
    metadata: Record<string, any>
    updatedAt: string
  }
}

const UpdateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
}).partial()

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.params.id
  const currentUserId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, UpdateUserSchema)

    // Get user and metadata
    const [user, metadata] = await db.transaction().execute(async (trx) => {
      const userPromise = trx
        .selectFrom('sq_users')
        .where('id', '=', userId)
        .where('deletedAt', 'is', null)
        .select(['id', 'firstName', 'lastName', 'username', 'avatarUrl'])
        .executeTakeFirst()

      const metadataPromise = trx
        .selectFrom('sq_user_metadata')
        .where('userId', '=', userId)
        .where('isPublic', '=', 1)
        .select(['key', 'value'])
        .execute()

      return Promise.all([userPromise, metadataPromise])
    })

    if (!user) {
      return createErrorResponse(event, 'User not found', 404)
    }

    // Only allow self update
    if (userId !== currentUserId) {
      await auditLog(event, {
        action: 'update',
        entity: 'user',
        entityId: userId,
        metadata: {
          success: false,
          reason: 'unauthorized_update',
          updatedBy: {
            id: currentUserId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'You can only update your own profile', 403)
    }

    // Filter out null values to keep existing data
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== null)
    )

    // Update user and track profile update in metadata
    const [updatedUser] = await db.transaction().execute(async (trx) => {
      const userUpdatePromise = trx
        .updateTable('sq_users')
        .set({
          ...updateData,
          updatedAt: now,
        })
        .where('id', '=', userId)
        .returning(['id', 'firstName', 'lastName', 'username', 'avatarUrl', 'updatedAt'])
        .executeTakeFirst()

      await trx
        .insertInto('sq_user_metadata')
        .values({
          id: typeid('meta').toString(),
          userId,
          key: 'profile_updated_at',
          value: String(now),
          isPublic: 1,
          createdAt: now,
        })
        .onConflict((oc) =>
          oc.columns(['userId', 'key']).doUpdateSet({ value: String(now), updatedAt: now })
        )
        .execute()

      return Promise.all([userUpdatePromise])
    })

    // Log update
    await auditLog(event, {
      action: 'update',
      entity: 'user',
      entityId: userId,
      metadata: {
        success: true,
        changes: updateData,
        updatedBy: {
          id: currentUserId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IUpdateUserResponse>(event, 'User profile updated successfully', {
      user: {
        ...updatedUser,
        metadata: metadata.reduce((acc, { key, value }) => {
          acc[key] = value
          return acc
        }, {}),
        updatedAt: toISOString(updatedUser.updatedAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Update user',
    tags: ['User Management'],
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
