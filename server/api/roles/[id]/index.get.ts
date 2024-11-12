export interface IGetRoleResponse {
  role: {
    id: string
    name: string
    description: string | null
    type: string
    organizationId: string | null
    isDefault: boolean
    metadata: Record<string, any>
    permissionCount: number
    createdAt: string
    updatedAt: string | null
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const roleId = event.context.params.id

  try {
    const role = await db
      .selectFrom('roles as r')
      .leftJoin('role_permissions as rp', 'rp.roleId', 'r.id')
      .where('r.id', '=', roleId)
      .select([
        'r.id',
        'r.name',
        'r.description',
        'r.type',
        'r.organizationId',
        'r.isDefault',
        'r.metadata',
        'r.createdAt',
        'r.updatedAt',
      ])
      .select((eb) => [eb.fn.count('rp.id').as('permissionCount')])
      .groupBy([
        'r.id',
        'r.name',
        'r.description',
        'r.type',
        'r.organizationId',
        'r.isDefault',
        'r.metadata',
        'r.createdAt',
        'r.updatedAt',
      ])
      .executeTakeFirst()

    if (!role) {
      return createErrorResponse(event, 'Role not found', 404)
    }

    return createSuccessResponse<IGetRoleResponse>(event, 'Role retrieved successfully', {
      role: {
        ...role,
        isDefault: Boolean(role.isDefault),
        metadata: JSON.parse(role.metadata || '{}'),
        permissionCount: Number(role.permissionCount),
        createdAt: toISOString(role.createdAt),
        updatedAt: toISOString(role.updatedAt),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Get list of roles',
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
