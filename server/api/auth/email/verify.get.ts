import { typeid } from 'typeid-js'

export interface IVerifyEmailResponse {
  verification: {
    callbackURL: string | null
    shouldRedirect: boolean
    verifiedAt: string
  }
}

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
      return createErrorResponse(event, 'Verification token is required', 400)
    }

    const verification = await db
      .selectFrom('verifications')
      .where('token', '=', token)
      .where('type', '=', 'email')
      .select(['id', 'userId', 'identifier', 'attempts', 'maxAttempts', 'verifiedAt', 'expiresAt'])
      .executeTakeFirst()

    if (!verification) {
      return createErrorResponse(event, 'Verification token not found', 404)
    }

    if (verification.verifiedAt) {
      return createErrorResponse(event, 'Email already verified', 400)
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
      const waitTimeMinutes = Math.ceil((rateLimit.blockedUntil - now) / 60)
      return createErrorResponse(
        event,
        `Too many verification attempts. Please try again in ${waitTimeMinutes} minutes`,
        429
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
          return createErrorResponse(event, 'Too many requests, try again in 30 minutes', 429)
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

      return createErrorResponse(
        event,
        'Token expired, check your email for a new verification link',
        410
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
          verifiedAt: now,
          updatedAt: now,
        })
        .where('userId', '=', verification.userId)
        .where('email', '=', verification.identifier)
        .execute()
    })

    await auditLog(event, {
      action: 'verify',
      entity: 'email',
      entityId: verification.id,
      userId: verification.userId,
      metadata: {
        success: true,
        email: verification.identifier,
      },
    })

    if (redirect && callbackURL) {
      return sendRedirect(event, callbackURL)
    }

    return createSuccessResponse<IVerifyEmailResponse>(event, 'Email verification successful', {
      verification: {
        callbackURL: callbackURL || null,
        shouldRedirect: redirect && !!callbackURL,
        verifiedAt: toISOString(now),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
