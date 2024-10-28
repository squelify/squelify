import * as jose from 'jose'
import { typeid } from 'typeid-js'
import { z } from 'zod'

const AddEmailSchema = z.object({ email: z.string().email('Email tidak valid') }).strict()

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

  const body = await readValidatedBody(event, (body) => AddEmailSchema.safeParse(body))
  if (!body.success) {
    return createErrorResponse(400, 'Invalid request', {
      issues: body.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  // Check if email already exists
  const existingEmail = await db
    .selectFrom('emails')
    .where('email', '=', body.data.email)
    .select(['id'])
    .executeTakeFirst()

  if (existingEmail) {
    return createErrorResponse(400, 'Email sudah terdaftar')
  }

  // Create verification token
  const verificationToken = typeid().toString()
  await db.transaction().execute(async (trx) => {
    // Add new email
    await trx
      .insertInto('emails')
      .values({
        id: typeid('eml').toString(),
        userId: payload.sub,
        email: body.data.email,
        isPrimary: 0,
        isVerified: 0,
        createdAt: now,
      })
      .execute()

    // Create verification record
    await trx
      .insertInto('verifications')
      .values({
        id: typeid('ver').toString(),
        userId: payload.sub,
        type: 'email',
        identifier: body.data.email,
        token: verificationToken,
        attempts: 0,
        maxAttempts: 3,
        expiresAt: now + 60 * 30, // 30 minutes
        createdAt: now,
      })
      .execute()
  })

  // Log verification URL for development
  logger.info('[auth]', `Email verification URL: /auth/emails/verify?token=${verificationToken}`)

  return {
    status: 200,
    success: true,
    message: 'Email berhasil ditambahkan, silakan cek inbox untuk verifikasi',
  }
})
