export interface IWhoAmIResponse {
  user: {
    id: string
    email: string | null
    username: string | null
    firstName: string | null
    lastName: string | null
    fullName: string
    avatarUrl: string | null
    roles: Array<{
      id: string
      name: string
      type: string
      organizationId: string | null
    }>
    permissions: Array<{
      id: string
      name: string
      category: string
      action: string
      resource: string
      conditions: Record<string, any>
    }>
    organizationId: string | null
    isAdmin: boolean
    session: {
      id: string | null
      lastSignInAt: string
      expiresAt: string | null
      requires2FA: boolean
      type2FA: string | null
      amr: string[]
    }
    isActive: boolean
    isBanned: boolean
    banReason: string | null
    bannedUntil: string | null
    metadata: Record<string, any>
    createdAt: string
    updatedAt: string | null
  }
}

export default defineEventHandler(async (event) => {
  const { payload, session } = event.context.auth
  const { db } = event.context

  try {
    const [userData, twoFactor, userBan, metadata, roles, permissions] = await db
      .transaction()
      .execute(async (trx) => {
        const userPromise = trx
          .selectFrom('users')
          .where('id', '=', payload.sub)
          .where('deletedAt', 'is', null)
          .selectAll()
          .executeTakeFirst()

        const twoFactorPromise = trx
          .selectFrom('two_factors')
          .where('userId', '=', payload.sub)
          .where('isVerified', '=', 1)
          .select(['type'])
          .executeTakeFirst()

        const userBanPromise = trx
          .selectFrom('user_bans')
          .where('userId', '=', payload.sub)
          .where((eb) =>
            eb.or([
              eb('expiresAt', '>', Math.floor(Date.now() / 1000)),
              eb('expiresAt', 'is', null),
            ])
          )
          .selectAll()
          .executeTakeFirst()

        const metadataPromise = trx
          .selectFrom('user_metadata')
          .where('userId', '=', payload.sub)
          .where('isPublic', '=', 1)
          .select(['key', 'value'])
          .execute()

        const rolesPromise = trx
          .selectFrom('roles')
          .innerJoin('user_roles', 'roles.id', 'user_roles.roleId')
          .where('user_roles.userId', '=', payload.sub)
          .select(['roles.id', 'roles.name', 'roles.type', 'roles.organizationId'])
          .execute()

        const permissionsPromise = trx
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
            'permissions.conditions',
          ])
          .execute()

        return Promise.all([
          userPromise,
          twoFactorPromise,
          userBanPromise,
          metadataPromise,
          rolesPromise,
          permissionsPromise,
        ])
      })

    if (!userData) {
      return createErrorResponse(event, 'User not found', 404)
    }

    const lastSignInMeta = metadata.find((m) => m.key === 'last_sign_in_at')
    const lastSignInAt = lastSignInMeta?.value
      ? toISOString(Number(lastSignInMeta.value))
      : toISOString(Date.now() / 1000)

    return createSuccessResponse<IWhoAmIResponse>(
      event,
      'User information retrieved successfully',
      {
        user: {
          // User data
          id: userData.id,
          email: payload?.email,
          username: userData?.username,
          firstName: userData?.firstName,
          lastName: userData?.lastName,
          fullName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
          avatarUrl: userData?.avatarUrl,

          // Access & permissions
          roles: roles.map((role) => ({
            id: role.id,
            name: role.name,
            type: role.type,
            organizationId: role.organizationId,
          })),
          permissions: permissions.map((perm) => ({
            id: perm.id,
            name: perm.name,
            category: perm.category,
            action: perm.action,
            resource: perm.resource,
            conditions: JSON.parse(JSON.stringify(perm.conditions)),
          })),
          organizationId: roles.find((r) => r.type === 'organization')?.organizationId || null,
          isAdmin: roles.some((r) => r.name === 'admin'),

          // Session & security
          session: {
            id: session?.id || null,
            lastSignInAt,
            expiresAt: session?.exp || null,
            requires2FA: !!twoFactor,
            type2FA: twoFactor?.type || null,
            amr: payload?.amr || [],
          },

          // Status & metadata
          isActive: Boolean(userData?.isActive),
          isBanned: !!userBan,
          banReason: userBan?.reason || null,
          bannedUntil: toISOString(userBan?.expiresAt),
          metadata: metadata.reduce((acc, { key, value }) => {
            acc[key] = value
            return acc
          }, {}),
          createdAt: toISOString(userData.createdAt),
          updatedAt: toISOString(userData.updatedAt),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
