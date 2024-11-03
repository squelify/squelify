import { typeid } from 'typeid-js'
import { PermissionSchema } from '~/database/schemas/permission'

export const CreatePermissionSchema = PermissionSchema.pick({
  name: true,
  description: true,
  category: true,
  action: true,
  resource: true,
  conditions: true,
}).partial({
  description: true,
  conditions: true,
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const roleId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, CreatePermissionSchema)

    // Get role
    const role = await db
      .selectFrom('roles')
      .where('id', '=', roleId)
      .select(['id', 'name', 'type', 'organizationId'])
      .executeTakeFirst()

    if (!role) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Role not found')
    }

    // Check existing permission
    const existingPermission = await db
      .selectFrom('permissions')
      .where('name', '=', body.name)
      .where('category', '=', body.category)
      .where('action', '=', body.action)
      .where('resource', '=', body.resource)
      .select(['id'])
      .executeTakeFirst()

    let permissionId: string

    // Create or reuse permission
    if (existingPermission) {
      permissionId = existingPermission.id
    } else {
      const newPermission = await db
        .insertInto('permissions')
        .values({
          id: typeid('prm').toString(),
          name: body.name,
          description: body.description || null,
          category: body.category,
          action: body.action,
          resource: body.resource,
          conditions: body.conditions || '{}',
          createdAt: now,
        })
        .returning(['id'])
        .executeTakeFirst()

      permissionId = newPermission.id
    }

    // Assign permission to role
    await db
      .insertInto('role_permissions')
      .values({
        id: typeid('rpr').toString(),
        roleId: role.id,
        permissionId: permissionId,
        createdAt: now,
      })
      .execute()

    // Get complete permission data
    const permission = await db
      .selectFrom('permissions')
      .where('id', '=', permissionId)
      .selectAll()
      .executeTakeFirst()

    // Log permission assignment
    await auditLog(event, {
      action: 'create',
      entity: 'permission',
      entityId: permissionId,
      metadata: {
        success: true,
        roleId: role.id,
        roleName: role.name,
        permission: {
          name: permission.name,
          category: permission.category,
          action: permission.action,
          resource: permission.resource,
        },
        createdBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return {
      status: 200,
      success: true,
      message: 'Permission assigned successfully',
      data: {
        id: permission.id,
        name: permission.name,
        description: permission.description,
        category: permission.category,
        action: permission.action,
        resource: permission.resource,
        conditions: JSON.parse(permission.conditions),
        createdAt: toISOString(permission.createdAt),
        updatedAt: toISOString(permission.updatedAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
