import { typeid } from 'typeid-js'
import { z } from 'zod'

export interface IUpdateRolePermissionsResponse {
  role: {
    id: string
    name: string
    type: string
    permissions: Array<{
      id: string
      name: string
      category: string
      action: string
      resource: string
    }>
  }
}

const UpdateRolePermissionsSchema = z.object({
  permissions: z.array(z.string().min(1, 'Permission ID is required')),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const roleId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, UpdateRolePermissionsSchema)

    // Get role
    const role = await db
      .selectFrom('sq_roles')
      .where('id', '=', roleId)
      .select(['id', 'name', 'type', 'organizationId'])
      .executeTakeFirst()

    if (!role) {
      return createErrorResponse(event, 'Role not found', 404)
    }

    // Verify permissions exist
    const permissions = await db
      .selectFrom('sq_permissions')
      .where('id', 'in', body.permissions)
      .select(['id', 'name', 'category', 'action', 'resource'])
      .execute()

    if (permissions.length !== body.permissions.length) {
      return createErrorResponse(event, 'One or more permissions not found', 404)
    }

    // Update role permissions in transaction
    await db.transaction().execute(async (trx) => {
      // Remove existing permissions
      await trx.deleteFrom('sq_role_permissions').where('roleId', '=', roleId).execute()

      // Add new permissions
      await trx
        .insertInto('sq_role_permissions')
        .values(
          body.permissions.map((permissionId) => ({
            id: typeid('rpr').toString(),
            roleId: role.id,
            permissionId,
            createdAt: now,
          }))
        )
        .execute()
    })

    // Log permissions update
    await auditLog(event, {
      action: 'update',
      entity: 'permission',
      entityId: roleId,
      metadata: {
        success: true,
        roleId: role.id,
        roleName: role.name,
        permissions: permissions.map((p) => ({
          id: p.id,
          name: p.name,
          category: p.category,
          action: p.action,
          resource: p.resource,
        })),
        updatedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IUpdateRolePermissionsResponse>(
      event,
      'Role permissions updated successfully',
      {
        role: {
          id: role.id,
          name: role.name,
          type: role.type,
          permissions: permissions,
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Update role permissions',
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
