export interface IListRolePermissionsResponse {
  role: {
    id: string
    name: string
    type: string
    organizationId: string | null
  }
  permissions: Array<{
    id: string
    name: string
    description: string | null
    category: string
    action: string
    resource: string
    conditions: Record<string, any>
    createdAt: string
    updatedAt: string | null
  }>
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const roleId = event.context.params.id

  try {
    // Get role with its permissions
    const role = await db
      .selectFrom('sq_roles')
      .where('id', '=', roleId)
      .select(['id', 'name', 'type', 'organizationId'])
      .executeTakeFirst()

    if (!role) {
      return createErrorResponse(event, 'Role not found', 404)
    }

    const permissions = await db
      .selectFrom('sq_permissions as p')
      .innerJoin('sq_role_permissions as rp', 'rp.permissionId', 'p.id')
      .where('rp.roleId', '=', roleId)
      .select([
        'p.id',
        'p.name',
        'p.description',
        'p.category',
        'p.action',
        'p.resource',
        'p.conditions',
        'p.createdAt',
        'p.updatedAt',
      ])
      .execute()

    const permissionsData = permissions.map((permission) => ({
      ...permission,
      conditions: JSON.parse(permission.conditions),
      createdAt: toISOString(permission.createdAt),
      updatedAt: toISOString(permission.updatedAt),
    }))

    return createSuccessResponse<IListRolePermissionsResponse>(
      event,
      'Role permissions retrieved successfully',
      {
        role,
        permissions: permissionsData,
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Get list permissions',
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
