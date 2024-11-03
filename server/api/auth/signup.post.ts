import { typeid } from 'typeid-js'
import { z } from 'zod'

export const SignupRequestSchema = z
  .object({
    email: z.string().email('Email tidak valid'),
    username: z
      .string()
      .min(3, 'Username minimal 3 karakter')
      .max(50, 'Username maksimal 50 karakter')
      .regex(/^[a-z0-9_]+$/, 'Username hanya boleh mengandung huruf kecil, angka, dan underscore')
      .optional(),
    password: z
      .string()
      .min(8, 'Password minimal 8 karakter')
      .regex(/[A-Z]/, 'Password harus mengandung huruf kapital')
      .regex(/[a-z]/, 'Password harus mengandung huruf kecil')
      .regex(/[0-9]/, 'Password harus mengandung angka')
      .regex(/[^A-Za-z0-9]/, 'Password harus mengandung karakter spesial'),
    firstName: z.string().min(2, 'Nama depan minimal 2 karakter'),
    lastName: z.string().optional(),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, SignupRequestSchema)

    // Check if email already exists
    const existingEmail = await db
      .selectFrom('emails')
      .where('email', '=', body.email)
      .select('id')
      .executeTakeFirst()

    if (existingEmail) {
      await auditLog(event, {
        action: 'create',
        entity: 'user',
        entityId: 'anonymous',
        metadata: {
          success: false,
          email: body.email,
          reason: 'email_exists',
        },
      })

      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Email sudah terdaftar')
    }

    let username = body.username

    // Generate username if not provided
    if (!username) {
      username = generateUsername(body.email)

      // Check username availability
      const existingUser = await db
        .selectFrom('users')
        .where('username', '=', username)
        .select(['id'])
        .executeTakeFirst()

      if (existingUser) {
        // Generate unique username with random suffix
        username = generateUsername(body.email, generateRandomStr({ size: 4 }))
      }
    }

    // Check final username availability
    const existingUser = await db
      .selectFrom('users')
      .where('username', '=', username)
      .select(['id'])
      .executeTakeFirst()

    if (existingUser) {
      await auditLog(event, {
        action: 'create',
        entity: 'user',
        entityId: 'anonymous',
        metadata: {
          success: false,
          email: body.email,
          reason: 'username_exists',
        },
      })

      setResponseStatus(event, 409)
      return createErrorResponse(409, `Username '${username}' is already taken`)
    }

    // Create user account
    const userId = typeid('user').toString()
    const hashedPassword = await hashPassword(body.password)
    const now = Math.floor(Date.now() / 1000)

    // Create user account transaction
    await db.transaction().execute(async (trx) => {
      // Create user first
      await trx
        .insertInto('users')
        .values({
          id: userId,
          firstName: body.firstName,
          lastName: body.lastName || null,
          username,
          isActive: 1,
          createdAt: now,
        })
        .execute()

      // Create password record
      await trx
        .insertInto('passwords')
        .values({
          id: typeid('pwd').toString(),
          userId,
          hash: hashedPassword,
          algorithm: 'scrypt',
          createdAt: now,
        })
        .execute()

      // Create account
      await trx
        .insertInto('accounts')
        .values({
          id: typeid('acc').toString(),
          userId,
          provider: 'local',
          providerAccountId: userId,
          createdAt: now,
        })
        .execute()

      // Create email
      await trx
        .insertInto('emails')
        .values({
          id: typeid('eml').toString(),
          userId,
          email: body.email,
          isPrimary: 1,
          createdAt: now,
        })
        .execute()

      // Create verification token
      const verificationToken = typeid().toString()
      await trx
        .insertInto('verifications')
        .values({
          id: typeid('ver').toString(),
          userId,
          type: 'email',
          identifier: body.email,
          token: verificationToken,
          expiresAt: now,
          createdAt: now,
        })
        .execute()

      // Send verification email
      const verificationUrl = `${appConfig.baseURL}/api/auth/email/verify?token=${verificationToken}`
      // await sendRawEmail('verify-email', body.email, `Verification URL: ${verificationUrl}`)
      logger.debug('[app]', `Verification URL: ${verificationUrl}`)

      // TODO: Send verification email using jsx-email
      // await sendJSXEmail('verify-email', body.email, {
      //   email: body.email,
      //   token: verificationToken,
      //   url: verificationUrl,
      // })
    })

    // Log successful signup after transaction
    await auditLog(event, {
      action: 'create',
      entity: 'user',
      entityId: userId,
      userId: userId,
      newValues: {
        id: userId,
        username,
        firstName: body.firstName,
        lastName: body.lastName,
        email: body.email,
      },
      metadata: {
        success: true,
      },
    })

    return {
      status: 200,
      success: true,
      message: 'Pendaftaran berhasil, silakan cek email untuk verifikasi',
    }
  } catch (error) {
    await auditLog(event, {
      action: 'create',
      entity: 'user',
      entityId: 'anonymous',
      metadata: {
        success: false,
        error: error.message,
      },
    })

    return throwErrorResponse(error)
  }
})
