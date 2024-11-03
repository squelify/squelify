import { z } from 'zod'

const QueryParamSchema = z.object({
  page: z.coerce.number().min(1, 'Page must be greater than 0'),
  limit: z.coerce
    .number()
    .min(1, 'Limit must be greater than 0')
    .max(100, 'Limit must not exceed 100'),
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
        .selectFrom('roles')
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated roles with permissions count
      const roles = await db
        .selectFrom('roles as r')
        .leftJoin('role_permissions as rp', 'rp.roleId', 'r.id')
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

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      const rolesData = roles.map((role) => ({
        id: role.id,
        name: role.name,
        description: role.description,
        type: role.type,
        organizationId: role.organizationId,
        isDefault: Boolean(role.isDefault),
        metadata: role.metadata, // FIXME Object is not valid JSON
        permissionCount: Number(role.permissionCount),
        createdAt: toISOString(role.createdAt),
        updatedAt: toISOString(role.updatedAt),
      }))

      return {
        status: 200,
        success: true,
        message: null,
        data: rolesData,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: Number(totalCount?.count || 0),
          itemsPerPage: limit,
        },
      }
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
