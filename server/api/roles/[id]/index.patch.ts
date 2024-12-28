import { RoleSchema } from '~/database/schemas/role'

export interface IUpdateRoleResponse {
  role: {
    id: string
    name: string
    description: string | null
    type: string
    organizationId: string | null
    metadata: Record<string, any>
    updatedAt: string
  }
}

const UpdateRoleSchema = RoleSchema.pick({
  name: true,
  description: true,
  type: true,
  organizationId: true,
  metadata: true,
}).partial()

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const roleId = event.context.params.id
  const userId = event.context.auth?.payload.sub
  const userEmail = event.context.auth?.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, UpdateRoleSchema)

    // Get existing role
    const role = await db
      .selectFrom('sq_roles')
      .where('id', '=', roleId)
      .selectAll()
      .executeTakeFirst()

    if (!role) {
      return createErrorResponse(event, 'Role not found', 404)
    }

    // Verify update permissions
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
          action: 'update',
          entity: 'role',
          entityId: roleId,
          metadata: {
            success: false,
            reason: 'unauthorized_update',
            updatedBy: {
              id: userId,
              email: userEmail,
            },
          },
        })

        return createErrorResponse(event, 'Only organization owners can update roles', 403)
      }
    }

    // Filter out null values
    const updateData = Object.fromEntries(
      Object.entries(body).filter(([_, value]) => value !== null)
    )

    // Update role
    const updatedRole = await db
      .updateTable('sq_roles')
      .set({
        ...updateData,
        updatedAt: now,
      })
      .where('id', '=', roleId)
      .returning(['id', 'name', 'description', 'type', 'organizationId', 'metadata', 'updatedAt'])
      .executeTakeFirst()

    // Log update
    await auditLog(event, {
      action: 'update',
      entity: 'role',
      entityId: roleId,
      metadata: {
        success: true,
        changes: updateData,
        updatedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IUpdateRoleResponse>(event, 'Role updated successfully', {
      role: {
        ...updatedRole,
        metadata: JSON.parse(updatedRole.metadata || '{}'),
        updatedAt: toISOString(updatedRole.updatedAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Update Role',
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
