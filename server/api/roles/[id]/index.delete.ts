export interface IDeleteRoleResponse {
  role: {
    id: string
    name: string
    type: string
    organizationId: string | null
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const roleId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email

  try {
    // Get role details
    const role = await db
      .selectFrom('sq_roles')
      .where('id', '=', roleId)
      .select(['id', 'name', 'type', 'organizationId', 'isDefault'])
      .executeTakeFirst()

    if (!role) {
      return createErrorResponse(event, 'Role not found', 404)
    }

    // Prevent deletion of default roles
    if (role.isDefault) {
      await auditLog(event, {
        action: 'delete',
        entity: 'role',
        entityId: roleId,
        metadata: {
          success: false,
          reason: 'default_role_protected',
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Default roles cannot be deleted', 400)
    }

    // Verify delete permissions
    if (role.type === 'organization') {
      const member = await db
        .selectFrom('sq_members')
        .where('organizationId', '=', role.organizationId)
        .where('userId', '=', userId)
        .where('role', '=', 'org:owner')
        .select(['id'])
        .executeTakeFirst()

      if (!member) {
        await auditLog(event, {
          action: 'delete',
          entity: 'role',
          entityId: roleId,
          metadata: {
            success: false,
            reason: 'unauthorized_deletion',
            deletedBy: {
              id: userId,
              email: userEmail,
            },
          },
        })

        return createErrorResponse(event, 'Only organization owners can delete roles', 403)
      }
    }

    // Delete role - cascading will handle role_permissions
    await db.deleteFrom('sq_roles').where('id', '=', roleId).execute()

    // Log successful deletion
    await auditLog(event, {
      action: 'delete',
      entity: 'role',
      entityId: roleId,
      metadata: {
        success: true,
        deletedRole: {
          id: role.id,
          name: role.name,
          type: role.type,
          organizationId: role.organizationId,
        },
        deletedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IDeleteRoleResponse>(event, 'Role deleted successfully', {
      role: {
        id: role.id,
        name: role.name,
        type: role.type,
        organizationId: role.organizationId,
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Delete role',
    tags: ['Authorization'],
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
