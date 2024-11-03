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

      setResponseStatus(event, 403)
      return createErrorResponse(403, 'Insufficient permissions to delete users')
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
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'User not found')
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

      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Admin cannot delete their own account')
    }

    // Delete user - cascading will handle all related records
    await db.deleteFrom('users').where('id', '=', userId).execute()

    // Log successful deletion
    await auditLog(event, {
      action: 'delete',
      entity: 'user',
      entityId: userId,
      metadata: {
        success: true,
        deletedUser: {
          id: user.id,
          email: user.email,
          name: `${user.firstName} ${user.lastName}`.trim(),
        },
        deletedBy: {
          id: adminId,
          email: adminEmail,
        },
      },
    })

    return {
      status: 200,
      success: true,
      message: 'User deleted successfully',
      data: {
        id: user.id,
        email: user.email,
        name: `${user.firstName} ${user.lastName}`.trim(),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
