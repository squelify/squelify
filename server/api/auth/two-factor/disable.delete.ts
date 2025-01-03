import { z } from 'zod'
import { verifyTOTP } from '~/utils/totp'

export interface IDisable2FAResponse {
  authenticator: {
    id: string
    name: string
    disabledAt: string
  }
}

const DisableTOTPSchema = z
  .object({
    id: z.string({ required_error: 'Authenticator ID is required' }),
    code: z.string().length(6, 'TOTP code must be 6 characters'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth?.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, DisableTOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    const twoFactor = await db
      .selectFrom('sq_two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .where('type', '=', 'totp')
      .select(['id', 'name', 'secret', 'isPrimary', 'verifiedAt', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      await auditLog(event, {
        action: 'disable',
        entity: 'two_factor',
        entityId: body.id,
        metadata: {
          success: false,
          reason: 'authenticator_not_found',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Authenticator not found', 404)
    }

    if (!twoFactor.verifiedAt) {
      await auditLog(event, {
        action: 'disable',
        entity: 'two_factor',
        entityId: body.id,
        metadata: {
          success: false,
          reason: 'not_verified',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Authenticator is not verified', 400)
    }

    const isValid = verifyTOTP(twoFactor.secret, body.code)
    if (!isValid) {
      await auditLog(event, {
        action: 'disable',
        entity: 'two_factor',
        entityId: body.id,
        metadata: {
          success: false,
          reason: 'invalid_code',
          userId: payload.sub,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Invalid TOTP code', 400)
    }

    if (twoFactor.isPrimary) {
      const otherVerified2FA = await db
        .selectFrom('sq_two_factors')
        .where('userId', '=', payload.sub)
        .where('id', '!=', twoFactor.id)
        .where('verifiedAt', '=', now)
        .select(['id', 'name'])
        .executeTakeFirst()

      if (!otherVerified2FA) {
        await auditLog(event, {
          action: 'disable',
          entity: 'two_factor',
          entityId: body.id,
          metadata: {
            success: false,
            reason: 'primary_no_backup',
          },
          retention: 'CRITICAL',
        })
        return createErrorResponse(
          event,
          'Cannot disable primary authenticator. Enable another authenticator first.',
          400
        )
      }

      await db
        .updateTable('sq_two_factors')
        .set({
          isPrimary: 1,
          updatedAt: now,
        })
        .where('id', '=', otherVerified2FA.id)
        .execute()
    }

    await db.deleteFrom('sq_two_factors').where('id', '=', twoFactor.id).execute()

    await auditLog(event, {
      action: 'disable',
      entity: 'two_factor',
      entityId: body.id,
      metadata: {
        success: true,
        userId: payload.sub,
        name: twoFactor.name,
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IDisable2FAResponse>(
      event,
      `Authenticator "${twoFactor.name}" disabled successfully`,
      {
        authenticator: {
          id: twoFactor.id,
          name: twoFactor.name,
          disabledAt: toISOString(now),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
