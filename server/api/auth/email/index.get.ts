import * as jose from 'jose'

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    // Get user's emails
    const rawEmails = await db
      .selectFrom('emails')
      .where('userId', '=', payload.sub)
      .select(['id', 'email', 'isPrimary', 'isVerified', 'verifiedAt', 'createdAt', 'updatedAt'])
      .orderBy('isPrimary', 'desc')
      .orderBy('createdAt', 'desc')
      .execute()

    // Transform data for response
    const emails = rawEmails.map((email) => ({
      id: email.id,
      email: email.email,
      isPrimary: Boolean(email.isPrimary),
      isVerified: Boolean(email.isVerified),
      verifiedAt: toISOString(email.verifiedAt),
      createdAt: toISOString(email.createdAt),
      updatedAt: toISOString(email.updatedAt),
    }))

    return {
      status: 200,
      success: true,
      data: emails,
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
