import { z } from 'zod'
import { hashPassword } from '~/utils/string'

const PasswordResetSchema = z
  .object({
    token: z.string({ required_error: 'Token diperlukan' }),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka')
      .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const body = await requireValidatedBody(event, PasswordResetSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get verification record
    const verification = await db
      .selectFrom('verifications')
      .where('token', '=', body.token)
      .where('type', '=', 'password_reset')
      .where('verifiedAt', 'is', null)
      .where('expiresAt', '>', now)
      .select(['id', 'userId', 'attempts', 'maxAttempts'])
      .executeTakeFirst()

    if (!verification) {
      return createErrorResponse(400, 'Token tidak valid atau sudah kadaluarsa')
    }

    if (verification.attempts >= verification.maxAttempts) {
      return createErrorResponse(400, 'Token sudah melebihi batas percobaan')
    }

    // Hash new password
    const hashedPassword = await hashPassword(body.password)

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

      // Update password
      await trx
        .updateTable('passwords')
        .set({
          hash: hashedPassword,
          lastChangedAt: now,
          updatedAt: now,
        })
        .where('userId', '=', verification.userId)
        .execute()
    })

    return {
      status: 200,
      success: true,
      message: 'Password berhasil diubah',
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
