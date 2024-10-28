import * as jose from 'jose'
import { z } from 'zod'

const RemoveEmailSchema = z
  .object({
    emailId: z.string({ required_error: 'Email ID diperlukan' }),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const token = getRequestHeader(event, 'Authorization')?.replace('Bearer ', '')

  if (!token) {
    return createErrorResponse(401, 'Token tidak ditemukan')
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

  const body = await readValidatedBody(event, (body) => RemoveEmailSchema.safeParse(body))
  if (!body.success) {
    return createErrorResponse(400, 'Invalid request', {
      issues: body.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  // Count user's verified emails
  const emailCount = await db
    .selectFrom('emails')
    .where('userId', '=', payload.sub)
    .where('isVerified', '=', 1)
    .select(({ fn }) => [fn.count<number>('id').as('count')])
    .executeTakeFirst()

  if (emailCount && Number(emailCount.count) <= 1) {
    return createErrorResponse(400, 'Tidak dapat menghapus email terakhir yang terverifikasi')
  }

  // Get email record
  const email = await db
    .selectFrom('emails')
    .where('id', '=', body.data.emailId)
    .where('userId', '=', payload.sub)
    .select(['id', 'email', 'isPrimary', 'isVerified'])
    .executeTakeFirst()

  if (!email) {
    return createErrorResponse(404, 'Email tidak ditemukan')
  }

  if (email.isPrimary) {
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
      .where('id', '=', body.data.emailId)
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
})
