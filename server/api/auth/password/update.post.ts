import * as jose from 'jose'
import { z } from 'zod'
import { hashPassword, verifyPassword } from '~/utils/string'

const PasswordUpdateSchema = z
  .object({
    currentPassword: z.string({ required_error: 'Password saat ini diperlukan' }),
    newPassword: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka')
      .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, PasswordUpdateSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get current password
    const currentPassword = await db
      .selectFrom('passwords')
      .where('userId', '=', payload.sub)
      .select(['id', 'hash'])
      .executeTakeFirst()

    if (!currentPassword) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Password tidak ditemukan')
    }

    // Verify current password
    const isValid = await verifyPassword(body.currentPassword, currentPassword.hash)
    if (!isValid) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Password saat ini tidak valid')
    }

    // Hash new password
    const hashedPassword = await hashPassword(body.newPassword)

    // Update password
    await db
      .updateTable('passwords')
      .set({
        hash: hashedPassword,
        updatedAt: now,
      })
      .where('id', '=', currentPassword.id)
      .execute()

    return {
      status: 200,
      success: true,
      message: 'Password berhasil diubah',
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
