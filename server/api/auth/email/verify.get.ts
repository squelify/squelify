import { typeid } from 'typeid-js'

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db

  try {
    const query = getQuery(event)
    const token = query.token as string
    const callbackURL = query.callbackURL as string
    const redirect = query.redirect === 'true'
    const now = Math.floor(Date.now() / 1000)

    if (!token) {
      return createErrorResponse(400, 'Token verifikasi diperlukan')
    }

    const verification = await db
      .selectFrom('verifications')
      .where('token', '=', token)
      .where('type', '=', 'email')
      .select(['id', 'userId', 'identifier', 'attempts', 'maxAttempts', 'verifiedAt', 'expiresAt'])
      .executeTakeFirst()

    if (!verification) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Token verifikasi tidak ditemukan')
    }

    if (verification.verifiedAt) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Email sudah terverifikasi')
    }

    // Check rate limit for token requests
    const rateLimit = await db
      .selectFrom('rate_limits')
      .where('key', '=', verification.identifier)
      .where('context', '=', 'email')
      .where('expiresAt', '>', now)
      .select(['points', 'blockedUntil'])
      .executeTakeFirst()

    if (rateLimit?.blockedUntil && rateLimit.blockedUntil > now) {
      setResponseStatus(event, 429)
      const waitTimeMinutes = Math.ceil((rateLimit.blockedUntil - now) / 60)
      return createErrorResponse(
        429,
        `Terlalu banyak permintaan verifikasi email. Silakan coba lagi dalam ${waitTimeMinutes} menit`
      )
    }

    // Handle expired token
    if (verification.expiresAt <= now) {
      // Update or create rate limit
      if (rateLimit) {
        const newPoints = rateLimit.points + 1
        const blocked = newPoints >= 3

        await db
          .updateTable('rate_limits')
          .set({
            points: newPoints,
            blockedUntil: blocked ? now + 30 * 60 : null, // Block for 30 minutes
            updatedAt: now,
          })
          .where('key', '=', verification.identifier)
          .where('context', '=', 'email')
          .execute()

        if (blocked) {
          setResponseStatus(event, 429)
          return createErrorResponse(
            429,
            'Terlalu banyak permintaan token, coba lagi dalam 30 menit'
          )
        }
      } else {
        await db
          .insertInto('rate_limits')
          .values({
            id: typeid('rlim').toString(),
            key: verification.identifier,
            context: 'email',
            points: 1,
            limit: 3,
            window: 3600, // 1 hour window
            expiresAt: now + 3600,
            createdAt: now,
          })
          .execute()
      }

      // Generate new token
      const newToken = typeid().toString()
      await db
        .insertInto('verifications')
        .values({
          id: typeid('ver').toString(),
          userId: verification.userId,
          type: 'email',
          identifier: verification.identifier,
          token: newToken,
          attempts: 0,
          maxAttempts: 3,
          expiresAt: now + 24 * 60 * 60,
          createdAt: now,
        })
        .execute()

      const verificationUrl = `${appConfig.baseURL}/api/auth/email/verify?token=${newToken}`
      logger.info('[app]', 'New verification email:', verificationUrl)

      setResponseStatus(event, 410)
      return createErrorResponse(
        410,
        'Token sudah kadaluarsa, silakan cek email untuk verifikasi ulang'
      )
    }

    // Verify email
    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable('verifications')
        .set({
          verifiedAt: now,
          attempts: verification.attempts + 1,
          updatedAt: now,
        })
        .where('id', '=', verification.id)
        .execute()

      await trx
        .updateTable('emails')
        .set({
          isVerified: 1,
          verifiedAt: now,
          updatedAt: now,
        })
        .where('userId', '=', verification.userId)
        .where('email', '=', verification.identifier)
        .execute()
    })

    const response = {
      status: 200,
      success: true,
      message: 'Email berhasil diverifikasi',
      data: {
        callbackURL: callbackURL || null,
        shouldRedirect: redirect && !!callbackURL,
      },
    }

    if (redirect && callbackURL) {
      return sendRedirect(event, callbackURL)
    }

    return response
  } catch (error) {
    return throwErrorResponse(error)
  }
})
