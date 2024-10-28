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
  try {
    const db = event.context.db
    const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

    if (!token) {
      return createErrorResponse(401, 'Unauthorized')
    }

    // Extract key ID from token header
    const decoded = jose.decodeProtectedHeader(token)
    if (!decoded.kid) {
      return createErrorResponse(401, 'Invalid token format')
    }

    const now = Math.floor(Date.now() / 1000)

    // Get JWK used for signing
    const jwk = await db
      .selectFrom('jwks')
      .where('keyId', '=', decoded.kid)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['keyId', 'publicKey', 'algorithm'])
      .executeTakeFirst()

    if (!jwk) {
      return createErrorResponse(401, 'Invalid token signature')
    }

    // Verify token and decode payload
    const payload = await verifyAccessToken(token, jwk)
    if (!payload) {
      return createErrorResponse(401, 'Token tidak valid')
    }

    // Check if session is still valid
    const session = await db
      .selectFrom('sessions')
      .where('id', '=', payload.sid)
      .where('userId', '=', payload.sub)
      .where('isActive', '=', 1)
      .where('expiresAt', '>', now)
      .select(['id'])
      .executeTakeFirst()

    if (!session) {
      return createErrorResponse(401, 'Session tidak valid atau telah berakhir')
    }

    const body = await readValidatedBody(event, (body) => PasswordUpdateSchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Get current password
    const currentPassword = await db
      .selectFrom('passwords')
      .where('userId', '=', payload.sub)
      .select(['id', 'hash'])
      .executeTakeFirst()

    if (!currentPassword) {
      return createErrorResponse(400, 'Password tidak ditemukan')
    }

    // Verify current password
    const isValid = await verifyPassword(body.data.currentPassword, currentPassword.hash)
    if (!isValid) {
      return createErrorResponse(400, 'Password saat ini tidak valid')
    }

    // Hash new password
    const hashedPassword = await hashPassword(body.data.newPassword)

    // Update password
    await db
      .updateTable('passwords')
      .set({
        hash: hashedPassword,
        lastChangedAt: now,
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
    return throwErrorResponse(error)
  }
})
