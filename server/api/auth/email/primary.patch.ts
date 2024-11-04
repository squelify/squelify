import { z } from 'zod'

export interface IUpdatePrimaryEmailResponse {
  email: {
    id: string
    address: string
    updatedAt: string
  }
}

const PrimaryEmailSchema = z
  .object({
    emailId: z.string({ required_error: 'Email ID is required' }),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, PrimaryEmailSchema)
    const now = Math.floor(Date.now() / 1000)

    const email = await db
      .selectFrom('emails')
      .where('id', '=', body.emailId)
      .where('userId', '=', payload.sub)
      .where('verifiedAt', 'is not', null)
      .select(['id', 'email'])
      .executeTakeFirst()

    if (!email) {
      await auditLog(event, {
        action: 'update',
        entity: 'email',
        entityId: body.emailId,
        metadata: {
          success: false,
          reason: 'email_not_found',
        },
        retention: 'CRITICAL',
      })

      return createErrorResponse(event, 'Email not found or not verified', 404)
    }

    await db.transaction().execute(async (trx) => {
      await trx
        .updateTable('emails')
        .set({
          isPrimary: 0,
          updatedAt: now,
        })
        .where('userId', '=', payload.sub)
        .execute()

      await trx
        .updateTable('emails')
        .set({
          isPrimary: 1,
          updatedAt: now,
        })
        .where('id', '=', body.emailId)
        .execute()
    })

    await auditLog(event, {
      action: 'update',
      entity: 'email',
      entityId: email.id,
      metadata: {
        success: true,
        userId: payload.sub,
        email: email.email,
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IUpdatePrimaryEmailResponse>(
      event,
      'Primary email updated successfully',
      {
        email: {
          id: email.id,
          address: email.email,
          updatedAt: toISOString(now),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
