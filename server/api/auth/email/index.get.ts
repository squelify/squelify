export interface IGetEmailsResponse {
  emails: Array<{
    id: string
    address: string
    isPrimary: boolean
    isVerified: boolean
    verifiedAt: string | null
    createdAt: string
    updatedAt: string
  }>
}

export default defineEventHandler(async (event) => {
  const payload = event.context.auth?.payload
  const db = event.context.db

  try {
    // Get user's emails
    const rawEmails = await db
      .selectFrom('_sq_emails')
      .where('userId', '=', payload.sub)
      .select(['id', 'email', 'isPrimary', 'verifiedAt', 'createdAt', 'updatedAt'])
      .orderBy('isPrimary', 'desc')
      .orderBy('createdAt', 'desc')
      .execute()

    // Transform data for response
    const emails = rawEmails.map((email) => ({
      id: email.id,
      address: email.email,
      isPrimary: Boolean(email.isPrimary),
      isVerified: Boolean(email.verifiedAt != null),
      verifiedAt: email.verifiedAt ? toISOString(email.verifiedAt) : null,
      createdAt: toISOString(email.createdAt),
      updatedAt: toISOString(email.updatedAt),
    }))

    return createSuccessResponse<IGetEmailsResponse>(event, null, {
      emails,
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
