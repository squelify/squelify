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
    const [userData, userBan, metadata, roles, permissions] = await Promise.all([
      db
        .selectFrom('users')
        .where('id', '=', payload.sub)
        .where('deletedAt', 'is', null)
        .selectAll()
        .executeTakeFirst(),

      db
        .selectFrom('user_bans')
        .where('userId', '=', payload.sub)
        .where((eb) =>
          eb.or([eb('expiresAt', '>', Math.floor(Date.now() / 1000)), eb('expiresAt', 'is', null)])
        )
        .selectAll()
        .executeTakeFirst(),

      db
        .selectFrom('user_metadata')
        .where('userId', '=', payload.sub)
        .where('isPublic', '=', 1)
        .select(['key', 'value'])
        .execute(),

      db
        .selectFrom('roles')
        .innerJoin('user_roles', 'roles.id', 'user_roles.roleId')
        .where('user_roles.userId', '=', payload.sub)
        .select(['roles.id', 'roles.name', 'roles.type', 'roles.organizationId'])
        .execute(),

      db
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
      return createErrorResponse(event, 'User not found', 404)
    }

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
