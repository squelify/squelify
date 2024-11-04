export interface IDeleteEmailResponse {
  email: {
    id: string
    address: string
    deletedAt: string
  }
}

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db
  const now = Math.floor(Date.now() / 1000)

  try {
    const emailCount = await db
      .selectFrom('emails')
      .where('userId', '=', payload.sub)
      .where('verifiedAt', 'is not', null)
      .select(({ fn }) => [fn.count<number>('id').as('count')])
      .executeTakeFirst()

    if (emailCount && Number(emailCount.count) <= 1) {
      await auditLog(event, {
        action: 'delete',
        entity: 'email',
        entityId: event.context.params.id,
        userId: payload.sub,
        metadata: {
          success: false,
          reason: 'last_verified_email',
        },
        retention: 'CRITICAL',
      })

      return createErrorResponse(event, 'Cannot delete last verified email', 400)
    }

    const email = await db
      .selectFrom('emails')
      .where('id', '=', event.context.params.id)
      .where('userId', '=', payload.sub)
      .select(['id', 'email', 'isPrimary', 'verifiedAt'])
      .executeTakeFirst()

    if (!email) {
      await auditLog(event, {
        action: 'delete',
        entity: 'email',
        entityId: event.context.params.id,
        userId: payload.sub,
        metadata: {
          success: false,
          reason: 'email_not_found',
        },
        retention: 'CRITICAL',
      })

      return createErrorResponse(event, 'Email not found', 404)
    }

    if (email.isPrimary) {
      await auditLog(event, {
        action: 'delete',
        entity: 'email',
        entityId: email.id,
        userId: payload.sub,
        metadata: {
          success: false,
          reason: 'primary_email',
          email: email.email,
        },
        retention: 'CRITICAL',
      })

      return createErrorResponse(event, 'Cannot delete primary email', 400)
    }

    await db.transaction().execute(async (trx) => {
      await trx
        .deleteFrom('verifications')
        .where('userId', '=', payload.sub)
        .where('identifier', '=', email.email)
        .where('type', '=', 'email')
        .execute()

      await trx
        .deleteFrom('emails')
        .where('id', '=', event.context.params.id)
        .where('userId', '=', payload.sub)
        .execute()
    })

    await auditLog(event, {
      action: 'delete',
      entity: 'email',
      entityId: email.id,
      metadata: {
        success: true,
        userId: payload.sub,
        email: email.email,
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IDeleteEmailResponse>(event, 'Email deleted successfully', {
      email: {
        id: email.id,
        address: email.email,
        deletedAt: toISOString(now),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
