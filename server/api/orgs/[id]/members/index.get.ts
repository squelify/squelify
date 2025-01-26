import { z } from 'zod'
import { DURATION } from '~/utils/datetime'

export interface IListMembersResponse {
  members: Array<{
    id: string
    role: string
    title: string | null
    department: string | null
    isDefault: boolean
    joinedAt: string
    invitedAt: string
    user: {
      id: string
      email: string
      firstName: string
      lastName: string | null
    }
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
    const orgId = event.context.params.id

    try {
      // Validate query params
      const query = getQuery(event)
      const { page, limit } = QueryParamSchema.parse(query)
      const offset = (page - 1) * limit

      // Get total count for pagination
      const totalCount = await db
        .selectFrom('_sq_members')
        .where('organizationId', '=', orgId)
        .select((eb) => eb.fn.countAll().as('count'))
        .executeTakeFirst()

      // Get paginated members with user info and primary email
      const members = await db
        .selectFrom('_sq_members as m')
        .innerJoin('_sq_users as u', 'u.id', 'm.userId')
        .leftJoin('_sq_emails as e', (join) =>
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

      if (!members?.length) {
        return createErrorResponse(event, 'No members found', 404)
      }

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

      return createSuccessResponse<IListMembersResponse>(event, 'Members retrieved successfully', {
        members: membersData,
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
