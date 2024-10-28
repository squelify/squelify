import * as jose from 'jose'
import { z } from 'zod'

const PrimaryEmailSchema = z
  .object({ emailId: z.string({ required_error: 'Email ID diperlukan' }) })
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

    const body = await readValidatedBody(event, (body) => PrimaryEmailSchema.safeParse(body))
    if (!body.success) {
      return createErrorResponse(400, 'Invalid request', {
        issues: body.error.issues.map((issue) => ({
          field: issue.path.join('.'),
          message: issue.message,
        })),
      })
    }

    // Get email record
    const email = await db
      .selectFrom('emails')
      .where('id', '=', body.data.emailId)
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
        .where('id', '=', body.data.emailId)
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
