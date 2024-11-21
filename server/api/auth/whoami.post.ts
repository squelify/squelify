import type { User } from '~/database/schemas/user'

export interface IUserInfoResponse {
  user: User & {
    email: string | null
    displayName: string
    roles: string[]
    permissions: string[]
    organizationId: string | null
    isAdmin: boolean
    isBanned: boolean
    banReason: string | null
    bannedUntil: string | null
    metadata: Record<string, any>
  }
  credentials: {
    sessionId: string | null
    sessionExpiry: string | null
  }
}

export default defineCachedEventHandler(
  async (event) => {
    const { payload, session } = event.context.auth
    const { db } = event.context

    try {
      // Execute all queries in a transaction for better consistency and performance
      const result = await db.transaction().execute(async (trx) => {
        const [userData, userBan, metadata, roles, permissions] = await Promise.all([
          trx
            .selectFrom('sq_users')
            .where('id', '=', payload.sub)
            .where('deletedAt', 'is', null)
            .selectAll()
            .executeTakeFirst(),

          trx
            .selectFrom('sq_user_bans')
            .where('userId', '=', payload.sub)
            .where((eb) =>
              eb.or([
                eb('expiresAt', '>', Math.floor(Date.now() / 1000)),
                eb('expiresAt', 'is', null),
              ])
            )
            .selectAll()
            .executeTakeFirst(),

          trx
            .selectFrom('sq_user_metadata')
            .where('userId', '=', payload.sub)
            .where('isPublic', '=', 1)
            .select(['key', 'value'])
            .execute(),

          trx
            .selectFrom('sq_roles as roles')
            .innerJoin('sq_user_roles as urole', 'roles.id', 'urole.roleId')
            .where('urole.userId', '=', payload.sub)
            .select(['roles.id', 'roles.name', 'roles.type', 'roles.organizationId'])
            .execute(),

          trx
            .selectFrom('sq_permissions as perms')
            .innerJoin('sq_role_permissions as rp', 'perms.id', 'rp.permissionId')
            .innerJoin('sq_user_roles as urole', 'rp.roleId', 'urole.roleId')
            .where('urole.userId', '=', payload.sub)
            .select(['perms.id', 'perms.name', 'perms.category', 'perms.action', 'perms.resource'])
            .execute(),
        ])

        if (!userData) {
          throw new Error('User not found')
        }

        return {
          userData,
          userBan,
          metadata,
          roles,
          permissions,
        }
      })

      const { userData, userBan, metadata, roles, permissions } = result

      return createSuccessResponse<IUserInfoResponse>(
        event,
        'User information retrieved successfully',
        {
          user: {
            ...userData,
            email: payload?.email,
            displayName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
            roles: roles.map((r) => r.name),
            permissions: permissions.map((p) => `${p.action}:${p.resource}`),
            organizationId: roles.find((r) => r.type === 'organization')?.organizationId || null,
            isAdmin: roles.some((r) => r.name === 'admin'),
            isBanned: !!userBan,
            banReason: userBan?.reason || null,
            bannedUntil: toISOString(userBan?.expiresAt),
            metadata: metadata.reduce((acc, { key, value }) => {
              acc[key] = value
              return acc
            }, {}),
          },
          credentials: {
            sessionId: session?.id || null,
            sessionExpiry: session?.exp || null,
          },
        }
      )
    } catch (error) {
      return throwErrorResponse(event, error)
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 * 12 * 30 /* 1 month */,
  }
)
