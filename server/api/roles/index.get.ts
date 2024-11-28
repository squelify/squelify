import { z } from 'zod'
import { DURATION } from '~/utils/datetime'

export interface IListRolesResponse {
  roles: Array<{
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
  }>
  pagination: {
    currentPage: number
    totalPages: number
    totalItems: number
    itemsPerPage: number
  }
}

const QueryParamSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be greater than 0').default(1),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be greater than 0')
    .max(100, 'Limit must not exceed 100')
    .default(10),
})

export default defineCachedEventHandler(
  async (event) => {
    const db = event.context.db

    try {
      // Validate query params
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await db
        .selectFrom('sq_roles')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated roles with permissions count
      const roles = await db
        .selectFrom('sq_roles as r')
        .leftJoin('sq_role_permissions as rp', 'rp.roleId', 'r.id')
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
        .limit(limit)
        .offset(offset)
        .orderBy('r.type')
        .orderBy('r.name')
        .execute()

      if (!roles?.length) {
        return createErrorResponse(event, 'No roles found', 404)
      }

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      const rolesData = roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        type: role.type,
        organizationId: role.organizationId,
        isDefault: Boolean(role.isDefault),
        metadata: JSON.parse(role.metadata || '{}'),
        permissionCount: Number(role.permissionCount),
        createdAt: toISOString(role.createdAt),
        updatedAt: toISOString(role.updatedAt),
      }))

      return createSuccessResponse<IListRolesResponse>(event, 'Roles retrieved successfully', {
        roles: rolesData,
        pagination: {
          currentPage: page,
          totalPages,
          totalItems: Number(totalCount?.count || 0),
          itemsPerPage: limit,
        },
      })
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: DURATION.HOUR,
  }
)

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
