import { UserSchema } from '~/database/schemas/user'

export interface IUpdateUserResponse {
  user: {
    id: string
    firstName: string
    lastName: string | null
    username: string
    avatarUrl: string | null
    locale: string | null
    updatedAt: string
  }
}

const UpdateUserSchema = UserSchema.pick({
  firstName: true,
  lastName: true,
  username: true,
  avatarUrl: true,
  locale: true,
}).partial()

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.params.id
  const currentUserId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, UpdateUserSchema)

    // Get user
    const user = await db
      .selectFrom('users')
      .where('id', '=', userId)
      .select(['id', 'firstName', 'lastName', 'username', 'avatarUrl', 'locale'])
      .executeTakeFirst()

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

    // Update user
    const updatedUser = await db
      .updateTable('users')
      .set({
        ...updateData,
        updatedAt: now,
      })
      .where('id', '=', userId)
      .returning(['id', 'firstName', 'lastName', 'username', 'avatarUrl', 'locale', 'updatedAt'])
      .executeTakeFirst()

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
        updatedAt: toISOString(updatedUser.updatedAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Update a user',
    tags: ['User Management'],
  },
})
