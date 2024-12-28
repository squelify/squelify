import { DURATION } from '~/utils/datetime'

export interface IGetOrganizationResponse {
  organization: {
    id: string
    name: string
    slug: string
    description: string | null
    logoUrl: string | null
    website: string | null
    email: string | null
    phone: string | null
    address: string | null
    status: string
    settings: Record<string, any>
    metadata: Record<string, any>
    isVerified: boolean
    createdBy: string
    createdAt: string
    updatedAt: string | null
    members: {
      total: number
      stats: Record<string, number>
    }
    owners: Array<{
      id: string
      email: string
      firstName: string
      lastName: string | null
      joinedAt: string
    }>
  }
}

export default defineCachedEventHandler(
  async (event) => {
    const db = event.context.db
    const orgId = event.context.params.id

    try {
      // Get organization details
      const org = await db
        .selectFrom('sq_organizations')
        .where('id', '=', orgId)
        .selectAll()
        .executeTakeFirst()

      if (!org) {
        return createErrorResponse(event, 'Organization not found', 404)
      }

      // Get member count by role
      const memberStats = await db
        .selectFrom('sq_members')
        .where('organizationId', '=', orgId)
        .select(['role'])
        .select((eb) => eb.fn.count('id').as('count'))
        .groupBy('role')
        .execute()

      // Get all owners info
      const owners = await db
        .selectFrom('sq_members as m')
        .innerJoin('sq_users as u', 'u.id', 'm.userId')
        .leftJoin('sq_emails as e', (join) =>
          join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
        )
        .where('m.organizationId', '=', orgId)
        .where('m.role', '=', 'org:owner')
        .select(['u.id as userId', 'u.firstName', 'u.lastName', 'e.email', 'm.joinedAt'])
        .execute()

      const organizationData = {
        ...org,
        settings: JSON.parse(org.settings),
        metadata: JSON.parse(org.metadata),
        isVerified: Boolean(org.isVerified),
        createdAt: toISOString(org.createdAt),
        updatedAt: toISOString(org.updatedAt),
        members: {
          total: memberStats.reduce((acc, curr) => acc + Number(curr.count), 0),
          stats: memberStats.reduce((acc, curr) => {
            acc[curr.role] = Number(curr.count)
            return acc
          }, {}),
        },
        owners: owners.map((owner) => ({
          id: owner.userId,
          email: owner.email,
          firstName: owner.firstName,
          lastName: owner.lastName,
          joinedAt: toISOString(owner.joinedAt),
        })),
      }

      return createSuccessResponse<IGetOrganizationResponse>(
        event,
        'Organization retrieved successfully',
        {
          organization: organizationData,
        }
      )
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: DURATION.HOUR,
  }
)
