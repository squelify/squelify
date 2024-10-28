import * as jose from 'jose'
import { z } from 'zod'

const PrimaryEmailSchema = z
  .object({ emailId: z.string({ required_error: 'Email ID diperlukan' }) })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const payload = await requireAuth(event)
    const body = await requireValidatedBody(event, PrimaryEmailSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get email record
    const email = await db
      .selectFrom('emails')
      .where('id', '=', body.emailId)
      .where('userId', '=', payload.sub)
      .where('isVerified', '=', 1)
      .select(['id', 'email'])
      .executeTakeFirst()

    if (!email) {
      return createErrorResponse(404, 'Email tidak ditemukan atau belum terverifikasi')
    }

    await db.transaction().execute(async (trx) => {
      // Reset all primary emails
      await trx
        .updateTable('emails')
        .set({
          isPrimary: 0,
          updatedAt: now,
        })
        .where('userId', '=', payload.sub)
        .execute()

      // Set new primary email
      await trx
        .updateTable('emails')
        .set({
          isPrimary: 1,
          updatedAt: now,
        })
        .where('id', '=', body.emailId)
        .execute()
    })

    return {
      status: 200,
      success: true,
      message: 'Email utama berhasil diubah',
      data: {
        emailId: email.id,
        email: email.email,
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
