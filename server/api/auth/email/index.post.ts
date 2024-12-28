import { isProduction } from 'std-env'
import { typeid } from 'typeid-js'
import { z } from 'zod'

export interface IAddEmailResponse {
  email: {
    address: string
    token: string
    verificationUrl?: string // Only in development
  }
}

const AddEmailSchema = z
  .object({
    email: z.string().email('Invalid email address'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth?.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, AddEmailSchema)
    const now = Math.floor(Date.now() / 1000)

    const existingEmail = await db
      .selectFrom('sq_emails')
      .where('email', '=', body.email)
      .select(['id'])
      .executeTakeFirst()

    if (existingEmail) {
      await auditLog(event, {
        action: 'create',
        entity: 'email',
        entityId: payload.sub,
        metadata: {
          success: false,
          reason: 'email_exists',
          email: body.email,
        },
        retention: 'CRITICAL',
      })

      return createErrorResponse(event, 'Email address already registered', 400)
    }

    const verificationToken = typeid().toString()
    await db.transaction().execute(async (trx) => {
      await trx
        .insertInto('sq_emails')
        .values({
          id: typeid('eml').toString(),
          userId: payload.sub,
          email: body.email,
          isPrimary: 0,
          createdAt: now,
        })
        .execute()

      await trx
        .insertInto('sq_verifications')
        .values({
          id: typeid('ver').toString(),
          userId: payload.sub,
          type: 'email',
          identifier: body.email,
          token: verificationToken,
          attempts: 0,
          maxAttempts: 3,
          expiresAt: now + DURATION.MINUTE * 30,
          createdAt: now,
        })
        .execute()
    })

    const verificationUrl = `/auth/email/verify?token=${verificationToken}`
    logger.info('[auth]', `Email verification URL: ${verificationUrl}`)

    await auditLog(event, {
      action: 'create',
      entity: 'email',
      entityId: payload.sub,
      metadata: {
        success: true,
        email: body.email,
      },
      retention: 'CRITICAL',
    })

    const response: IAddEmailResponse = {
      email: {
        address: body.email,
        token: verificationToken,
      },
    }

    if (!isProduction) {
      response.email.verificationUrl = verificationUrl
    }

    const message = 'Email added successfully, check your inbox for verification'

    return createSuccessResponse<IAddEmailResponse>(event, message, response)
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
