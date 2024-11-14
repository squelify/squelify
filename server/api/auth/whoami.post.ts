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
    validUntil: string | null
    validityPeriod: number
  }
}

export default defineEventHandler(async (event) => {
  const { payload, session } = event.context.auth
  const { db } = event.context

  try {
    // Execute all queries in a transaction for better consistency and performance
    const result = await db.transaction().execute(async (trx) => {
      const [userData, userBan, metadata, roles, permissions] = await Promise.all([
        trx
          .selectFrom('users')
          .where('id', '=', payload.sub)
          .where('deletedAt', 'is', null)
          .selectAll()
          .executeTakeFirst(),

        trx
          .selectFrom('user_bans')
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
          .selectFrom('user_metadata')
          .where('userId', '=', payload.sub)
          .where('isPublic', '=', 1)
          .select(['key', 'value'])
          .execute(),

        trx
          .selectFrom('roles')
          .innerJoin('user_roles', 'roles.id', 'user_roles.roleId')
          .where('user_roles.userId', '=', payload.sub)
          .select(['roles.id', 'roles.name', 'roles.type', 'roles.organizationId'])
          .execute(),

        trx
          .selectFrom('permissions')
          .innerJoin('role_permissions', 'permissions.id', 'role_permissions.permissionId')
          .innerJoin('user_roles', 'role_permissions.roleId', 'user_roles.roleId')
          .where('user_roles.userId', '=', payload.sub)
          .select([
            'permissions.id',
            'permissions.name',
            'permissions.category',
            'permissions.action',
            'permissions.resource',
          ])
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
          validUntil: session?.exp || null,
          validityPeriod: DURATION.MINUTE * 15,
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
