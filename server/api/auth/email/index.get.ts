import * as jose from 'jose'

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const payload = await requireAuth(event)

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
      verifiedAt: email.verifiedAt ? new Date(email.verifiedAt * 1000).toISOString() : null,
      createdAt: new Date(email.createdAt * 1000).toISOString(),
      updatedAt: email.updatedAt ? new Date(email.updatedAt * 1000).toISOString() : null,
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
