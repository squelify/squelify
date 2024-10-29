export default defineEventHandler(async (event) => {
  const { payload, session } = event.context.auth
  const { db } = event.context

  try {
    // Execute queries in parallel using Promise.all within transaction
    const [userData, twoFactor] = await db.transaction().execute(async (trx) => {
      const userPromise = trx
        .selectFrom('users')
        .where('id', '=', payload.sub)
        .selectAll()
        .executeTakeFirst()

      const twoFactorPromise = trx
        .selectFrom('two_factors')
        .where('userId', '=', payload.sub)
        .where('isVerified', '=', 1)
        .select(['type'])
        .executeTakeFirst()

      return Promise.all([userPromise, twoFactorPromise])
    })

    if (!userData) {
      throw createError({ statusCode: 404, message: 'User not found' })
    }

    return {
      status: 200,
      success: true,
      data: {
        // User data
        id: userData.id,
        email: payload?.email,
        username: userData?.username,
        firstName: userData?.firstName,
        lastName: userData?.lastName,
        fullName: `${userData?.firstName || ''} ${userData?.lastName || ''}`.trim(),
        avatarUrl: userData?.avatarUrl,
        locale: userData?.locale,

        // Access & permissions
        roles: payload?.roles || [],
        permissions: payload?.perms || [],
        organizationId: payload?.org_id,
        isAdmin: payload?.roles?.includes('admin') || false,

        // Session & security
        session: {
          id: session?.id || null,
          exp: session?.exp || null,
          lastSignInAt: userData?.lastSignInAt,
          requires2FA: !!twoFactor,
          type2FA: twoFactor?.type || null,
          amr: payload?.amr || [],
        },

        // Status & metadata
        isActive: Boolean(userData?.isActive),
        isBanned: Boolean(userData?.isBanned),
        banReason: userData?.banReason || null,
        bannedUntil: toISOString(userData.bannedUntil),
        lastSignInAt: toISOString(userData.lastSignInAt),
        createdAt: toISOString(userData.createdAt),
        updatedAt: toISOString(userData.updatedAt),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
