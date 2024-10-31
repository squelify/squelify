export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    // Count user's verified emails
    const emailCount = await db
      .selectFrom('emails')
      .where('userId', '=', payload.sub)
      .where('isVerified', '=', 1)
      .select(({ fn }) => [fn.count<number>('id').as('count')])
      .executeTakeFirst()

    if (emailCount && Number(emailCount.count) <= 1) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Tidak dapat menghapus email terakhir yang terverifikasi')
    }

    // Get email record
    const email = await db
      .selectFrom('emails')
      .where('id', '=', event.context.params.id)
      .where('userId', '=', payload.sub)
      .select(['id', 'email', 'isPrimary', 'isVerified'])
      .executeTakeFirst()

    if (!email) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Email tidak ditemukan')
    }

    if (email.isPrimary) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Email utama tidak dapat dihapus')
    }

    // Delete email and related verifications
    await db.transaction().execute(async (trx) => {
      // Delete verifications
      await trx
        .deleteFrom('verifications')
        .where('userId', '=', payload.sub)
        .where('identifier', '=', email.email)
        .where('type', '=', 'email')
        .execute()

      // Delete email
      await trx
        .deleteFrom('emails')
        .where('id', '=', event.context.params.id)
        .where('userId', '=', payload.sub)
        .execute()
    })

    return {
      status: 200,
      success: true,
      message: 'Email berhasil dihapus',
      data: {
        emailId: email.id,
        email: email.email,
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
