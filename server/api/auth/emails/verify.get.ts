export default defineEventHandler(async (event) => {
  const db = event.context.db
  const query = getQuery(event)
  const token = query.token as string
  const callbackUrl = query.callbackUrl as string
  const redirect = query.redirect === 'true'

  if (!token) {
    const response = {
      status: 400,
      success: false,
      message: 'Token tidak ditemukan',
      data: {
        callbackUrl: callbackUrl || null,
        shouldRedirect: redirect && !!callbackUrl,
      },
    }
    return response
  }

  const now = Math.floor(Date.now() / 1000)

  const verification = await db
    .selectFrom('verifications')
    .where('token', '=', token)
    .where('type', '=', 'email')
    .select(['id', 'userId', 'identifier', 'attempts', 'maxAttempts', 'verifiedAt', 'expiresAt'])
    .executeTakeFirst()

  if (!verification) {
    const response = {
      status: 404,
      success: false,
      message: 'Token verifikasi tidak ditemukan',
      data: {
        callbackUrl: callbackUrl || null,
        shouldRedirect: redirect && !!callbackUrl,
      },
    }
    return response
  }

  if (verification.verifiedAt) {
    const response = {
      status: 400,
      success: false,
      message: 'Email sudah terverifikasi',
      data: {
        callbackUrl: callbackUrl || null,
        shouldRedirect: redirect && !!callbackUrl,
      },
    }
    return response
  }

  if (verification.expiresAt <= now) {
    const response = {
      status: 400,
      success: false,
      message: 'Token sudah kadaluarsa',
      data: {
        callbackUrl: callbackUrl || null,
        shouldRedirect: redirect && !!callbackUrl,
      },
    }
    return response
  }

  if (verification.attempts >= verification.maxAttempts) {
    const response = {
      status: 400,
      success: false,
      message: 'Token melebihi batas maksimal percobaan',
      data: {
        callbackUrl: callbackUrl || null,
        shouldRedirect: redirect && !!callbackUrl,
      },
    }
    return response
  }

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

  const shouldRedirect = redirect && !!callbackUrl

  const response = {
    status: 200,
    success: true,
    message: 'Email berhasil diverifikasi',
    data: {
      callbackUrl: callbackUrl || null,
      shouldRedirect,
    },
  }

  if (shouldRedirect) {
    return sendRedirect(event, callbackUrl)
  }

  return response
})
