export interface IDeleteUserResponse {
  user: {
    id: string
    email: string
    name: string
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.params.id
  const adminId = event.context.auth.payload.sub
  const adminEmail = event.context.auth.payload.email

  try {
    // Verify admin permissions
    const adminRoles = await db
      .selectFrom('roles as r')
      .innerJoin('role_permissions as rp', 'rp.roleId', 'r.id')
      .innerJoin('permissions as p', 'p.id', 'rp.permissionId')
      .where('r.type', '=', 'system')
      .where('p.action', '=', 'delete')
      .where('p.resource', '=', 'user')
      .select(['r.id', 'r.name'])
      .execute()

    if (!adminRoles.length) {
      await auditLog(event, {
        action: 'delete',
        entity: 'user',
        entityId: userId,
        metadata: {
          success: false,
          reason: 'insufficient_permission',
          deletedBy: {
            id: adminId,
            email: adminEmail,
          },
        },
      })

      return createErrorResponse(event, 'You do not have permission to delete users', 403)
    }

    // Get user with primary email
    const user = await db
      .selectFrom('users as u')
      .leftJoin('emails as e', (join) =>
        join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
      )
      .where('u.id', '=', userId)
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
          deletedBy: {
            id: adminId,
            email: adminEmail,
          },
        },
      })

      return createErrorResponse(event, 'Administrators cannot delete their own account', 400)
    }

    // Delete user - cascading will handle all related records
    await db.deleteFrom('users').where('id', '=', userId).execute()

    const userData = {
      id: user.id,
      email: user.email,
      name: `${user.firstName} ${user.lastName}`.trim(),
    }

    // Log successful deletion
    await auditLog(event, {
      action: 'delete',
      entity: 'user',
      entityId: userId,
      metadata: {
        success: true,
        deletedUser: userData,
        deletedBy: {
          id: adminId,
          email: adminEmail,
        },
      },
    })

    return createSuccessResponse<IDeleteUserResponse>(event, 'User deleted successfully', {
      user: userData,
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Delete a user',
    tags: ['User Management'],
  },
})
