import { typeid } from 'typeid-js'
import { z } from 'zod'
import { AppConfig } from '~/config'
import { EmailSchema } from '~/database/schemas/email'
import { UserSchema } from '~/database/schemas/user'
import { hashPassword } from '~/utils/string'

const SignupRequestSchema = z
  .object({
    email: EmailSchema.shape.email,
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka')
      .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial'),
    firstName: UserSchema.shape.firstName,
    lastName: UserSchema.shape.lastName,
  })
  .strict() // Will error if payload contains undefined fields

export type SignupRequest = z.infer<typeof SignupRequestSchema>

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const appConfig = useAppConfig(event) as AppConfig
  const body = await readValidatedBody(event, (body) => SignupRequestSchema.safeParse(body))

  if (!body.success) {
    return createErrorResponse(400, 'Invalid request', {
      issues: body.error.issues.map((issue) => ({
        field: issue.path.join('.'),
        message: issue.message,
      })),
    })
  }

  const now = Math.floor(Date.now() / 1000)

  // Check if email already exists
  const existingEmail = await db
    .selectFrom('emails')
    .where('email', '=', body.data.email)
    .select('id')
    .executeTakeFirst()

  if (existingEmail) {
    return createErrorResponse(400, 'Email sudah terdaftar')
  }

  // Create user account
  const userId = typeid('user').toString()
  const hashedPassword = await hashPassword(body.data.password)

  await db.transaction().execute(async (trx) => {
    // Insert user
    await trx
      .insertInto('users')
      .values({
        id: userId,
        firstName: body.data.firstName,
        lastName: body.data.lastName,
        locale: 'id',
        isActive: 1,
        createdAt: now,
      })
      .execute()

    // Insert email
    await trx
      .insertInto('emails')
      .values({
        id: typeid('eml').toString(),
        userId,
        email: body.data.email,
        isPrimary: 1,
        isVerified: 0,
        createdAt: now,
      })
      .execute()

    // Insert password
    await trx
      .insertInto('passwords')
      .values({
        id: typeid('pwd').toString(),
        userId,
        hash: hashedPassword,
        algorithm: 'argon2id',
        createdAt: now,
      })
      .execute()

    // Create verification token
    const verificationToken = typeid('ver').toString()
    await trx
      .insertInto('verifications')
      .values({
        id: typeid('ver').toString(),
        userId,
        type: 'email',
        identifier: body.data.email,
        token: verificationToken,
        expiresAt: now + 24 * 60 * 60, // 24 hours
        createdAt: now,
      })
      .execute()

    // Send verification email
    const verificationUrl = `${appConfig.baseURL}/api/auth/verify-email?token=${verificationToken}`
    logger.info('[app]', 'Verification email: ', verificationUrl)
  })

  return {
    status: 200,
    success: true,
    message: 'Pendaftaran berhasil, silakan cek email untuk verifikasi',
  }
})
