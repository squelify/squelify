import { UserSchema } from '~/database/schemas/user'

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
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'User not found')
    }

    // Only allow self update
    if (userId !== currentUserId) {
      await auditLog(event, {
        action: 'update',
        entity: 'user',
        entityId: userId,
        metadata: {
          success: false,
          reason: 'not_self',
          updatedBy: {
            id: currentUserId,
            email: userEmail,
          },
        },
      })

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Can only update own profile')
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

    return {
      status: 200,
      success: true,
      message: 'User updated successfully',
      data: {
        ...updatedUser,
        updatedAt: toISOString(updatedUser.updatedAt),
      },
    }
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
