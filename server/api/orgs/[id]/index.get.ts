export default defineCachedEventHandler(
  async (event) => {
    const db = event.context.db
    const orgId = event.context.params.id

    try {
      // Get organization details
      const org = await db
        .selectFrom('organizations')
        .where('id', '=', orgId)
        .select([
          'id',
          'name',
          'slug',
          'description',
          'logoUrl',
          'website',
          'email',
          'phone',
          'address',
          'status',
          'settings',
          'metadata',
          'isVerified',
          'createdBy',
          'createdAt',
          'updatedAt',
        ])
        .executeTakeFirst()

      if (!org) {
        setResponseStatus(event, 404)
        return createErrorResponse(404, 'Organization not found')
      }

      // Get member count by role
      const memberStats = await db
        .selectFrom('members')
        .where('organizationId', '=', orgId)
        .select(['role'])
        .select((eb) => eb.fn.count('id').as('count'))
        .groupBy('role')
        .execute()

      // Get all owners info
      const owners = await db
        .selectFrom('members as m')
        .innerJoin('users as u', 'u.id', 'm.userId')
        .leftJoin('emails as e', (join) =>
          join.onRef('e.userId', '=', 'u.id').on('e.isPrimary', '=', 1)
        )
        .where('m.organizationId', '=', orgId)
        .where('m.role', '=', 'owner')
        .select(['u.id as userId', 'u.firstName', 'u.lastName', 'e.email', 'm.joinedAt'])
        .execute()

      // Transform data
      const orgData = {
        ...org,
        settings: org.settings,
        metadata: org.metadata,
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

      return {
        status: 200,
        success: true,
        message: null,
        data: orgData,
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
