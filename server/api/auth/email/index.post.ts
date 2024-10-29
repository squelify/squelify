import { typeid } from 'typeid-js'
import { z } from 'zod'

const AddEmailSchema = z.object({ email: z.string().email('Email tidak valid') }).strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, AddEmailSchema)
    const now = Math.floor(Date.now() / 1000)

    // Check if email already exists
    const existingEmail = await db
      .selectFrom('emails')
      .where('email', '=', body.email)
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
          email: body.email,
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
          identifier: body.email,
          token: verificationToken,
          attempts: 0,
          maxAttempts: 3,
          expiresAt: now + 60 * 30, // 30 minutes
          createdAt: now,
        })
        .execute()
    })

    // Log verification URL for development
    logger.info('[auth]', `Email verification URL: /auth/email/verify?token=${verificationToken}`)

    return {
      status: 200,
      success: true,
      message: 'Email berhasil ditambahkan, silakan cek inbox untuk verifikasi',
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
