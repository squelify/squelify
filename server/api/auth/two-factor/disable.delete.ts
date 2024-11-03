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
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, DisableTOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get TOTP record with complete status check
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .where('type', '=', 'totp')
      .select(['id', 'name', 'secret', 'isPrimary', 'isVerified', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(event, 'Authenticator not found', 404)
    }

    if (!twoFactor.isVerified) {
      return createErrorResponse(event, 'Authenticator is not verified', 400)
    }

    // Verify TOTP code first
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
      })

      return createErrorResponse(event, 'Invalid TOTP code', 400)
    }

    // Check if this is the last verified 2FA
    if (twoFactor.isPrimary) {
      const otherVerified2FA = await db
        .selectFrom('two_factors')
        .where('userId', '=', payload.sub)
        .where('id', '!=', twoFactor.id)
        .where('isVerified', '=', 1)
        .select(['id', 'name'])
        .executeTakeFirst()

      if (!otherVerified2FA) {
        return createErrorResponse(
          event,
          'Cannot disable primary authenticator. Enable another authenticator first.',
          400
        )
      }

      // Set other 2FA as primary
      await db
        .updateTable('two_factors')
        .set({
          isPrimary: 1,
          updatedAt: now,
        })
        .where('id', '=', otherVerified2FA.id)
        .execute()
    }

    // Delete the TOTP record
    await db.deleteFrom('two_factors').where('id', '=', twoFactor.id).execute()

    await auditLog(event, {
      action: 'disable',
      entity: 'two_factor',
      entityId: body.id,
      metadata: {
        success: true,
        userId: payload.sub,
        name: twoFactor.name,
      },
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
