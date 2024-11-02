import { z } from 'zod'

// Query params schema
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
    const orgId = event.context.params.id

    try {
      // Validate query params
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await db
        .selectFrom('members')
        .where('organizationId', '=', orgId)
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated members with user info and primary email
      const members = await db
        .selectFrom('members as m')
        .innerJoin('users as u', 'u.id', 'm.userId')
        .leftJoin('emails as e', (join) =>
          join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
        )
        .where('m.organizationId', '=', orgId)
        .select([
          'm.id',
          'm.role',
          'm.title',
          'm.department',
          'm.isDefault',
          'm.joinedAt',
          'm.invitedBy',
          'm.invitedAt',
          'u.id as userId',
          'u.firstName',
          'u.lastName',
          'e.email',
        ])
        .limit(limit)
        .offset(offset)
        .execute()

      const totalPages = Math.ceil(Number(totalCount?.count || 0) / limit)

      const membersData = members.map((member) => ({
        id: member.id,
        role: member.role,
        title: member.title,
        department: member.department,
        isDefault: Boolean(member.isDefault),
        joinedAt: toISOString(member.joinedAt),
        invitedAt: toISOString(member.invitedAt),
        user: {
          id: member.userId,
          email: member.email,
          firstName: member.firstName,
          lastName: member.lastName,
        },
      }))

      return {
        status: 200,
        success: true,
        message: null,
        data: membersData,
        meta: {
          currentPage: page,
          totalPages,
          totalItems: Number(totalCount?.count || 0),
          itemsPerPage: limit,
        },
      }
    } catch (error) {
      return throwErrorResponse(error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
