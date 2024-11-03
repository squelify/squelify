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
      return createErrorResponse(event, 'Email address already registered', 400)
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
    })

    const response: IAddEmailResponse = {
      email: {
        address: body.email,
        token: verificationToken,
      },
    }

    // Include verification URL in development
    if (!isProduction) {
      response.email.verificationUrl = verificationUrl
    }

    return createSuccessResponse<IAddEmailResponse>(
      event,
      'Email added successfully, check your inbox for verification',
      response
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
