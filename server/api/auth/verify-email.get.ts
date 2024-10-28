export default defineEventHandler(async (event) => {
  const db = event.context.db
  const query = getQuery(event)
  const token = query.token as string

  if (!token) {
    return sendRedirect(event, '/auth/invalid-token?reason=missing')
  }

  const now = Math.floor(Date.now() / 1000)

  // Get verification record with detailed check
  const verification = await db
    .selectFrom('verifications')
    .where('token', '=', token)
    .where('type', '=', 'email')
    .select(['id', 'userId', 'identifier', 'attempts', 'maxAttempts', 'verifiedAt', 'expiresAt'])
    .executeTakeFirst()

  if (!verification) {
    return sendRedirect(event, '/auth/invalid-token?reason=not_found')
  }

  // Check various invalid states
  if (verification.verifiedAt) {
    return sendRedirect(event, '/auth/invalid-token?reason=already_verified')
  }

  if (verification.expiresAt <= now) {
    return sendRedirect(event, '/auth/invalid-token?reason=expired')
  }

  if (verification.attempts >= verification.maxAttempts) {
    return sendRedirect(event, '/auth/invalid-token?reason=max_attempts')
  }

  await db.transaction().execute(async (trx) => {
    // Update verification record
    await trx
      .updateTable('verifications')
      .set({
        verifiedAt: now,
        attempts: verification.attempts + 1,
        updatedAt: now,
      })
      .where('id', '=', verification.id)
      .execute()

    // Update email verification status
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

  return sendRedirect(event, '/auth/login?auth_state=email-verified')
})
