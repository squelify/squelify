export interface IDeleteUserResponse {
  user: {
    id: string
    email: string
    name: string
    deletedAt: number | null
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.params?.id
  const adminId = event.context.auth?.payload.sub
  const adminEmail = event.context.auth?.payload.email
  const hardDelete = event.context.query.hard === 'true'

  try {
    // Get user with primary email
    const user = await db
      .selectFrom('sq_users as u')
      .leftJoin('sq_emails as e', (join) =>
        join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
      )
      .where('u.id', '=', userId)
      .where('u.deletedAt', 'is', null)
      .select(['u.id', 'u.firstName', 'u.lastName', 'e.email'])
      .executeTakeFirst()

    if (!user) {
      return createErrorResponse(event, 'User not found', 404)
    }

    // Prevent admin from deleting themselves
    if (userId === adminId) {
      await auditLog(event, {
        action: 'delete',
        entity: 'user',
        entityId: userId,
        metadata: {
          success: false,
          reason: 'self_deletion_prevented',
          deletedBy: { id: adminId, email: adminEmail },
        },
      })
      return createErrorResponse(event, 'Administrators cannot delete their own account', 400)
    }

    const now = Math.floor(Date.now() / 1000)

    if (hardDelete) {
      // Hard delete - remove all records
      await db.deleteFrom('sq_users').where('id', '=', userId).execute()
    } else {
      // Soft delete - update deletedAt timestamp
      await db
        .updateTable('sq_users')
        .set({ deletedAt: now, updatedAt: now })
        .where('id', '=', userId)
        .execute()
    }

    const userData = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
      deletedAt: hardDelete ? null : now,
    }

    await auditLog(event, {
      action: 'delete',
      entity: 'user',
      entityId: userId,
      metadata: {
        success: true,
        deletedUser: userData,
        deletedBy: { id: adminId, email: adminEmail },
        deleteType: hardDelete ? 'hard' : 'soft',
      },
    })

    return createSuccessResponse<IDeleteUserResponse>(
      event,
      `User ${hardDelete ? 'permanently deleted' : 'deleted'} successfully`,
      { user: userData }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Delete user',
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
