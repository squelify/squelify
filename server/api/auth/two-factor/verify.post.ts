import { z } from 'zod'
import { verifyTOTP } from '~/utils/totp'

export interface IVerifyTOTPResponse {
  verification: {
    id: string
    type: 'totp'
    isVerified: boolean
    verifiedAt: string
    lastUsedAt: string
  }
}

const VerifyTOTPSchema = z
  .object({
    id: z.string({ required_error: 'TOTP ID is required' }),
    code: z.string().length(6, 'TOTP code must be 6 characters'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, VerifyTOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get TOTP record
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .where('type', '=', 'totp')
      .select(['id', 'secret', 'isVerified'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(event, 'TOTP not found', 404)
    }

    // Verify TOTP code
    const isValid = verifyTOTP(twoFactor.secret, body.code)
    if (!isValid) {
      await auditLog(event, {
        action: 'verify',
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

    // Update TOTP status if not verified
    if (!twoFactor.isVerified) {
      await db
        .updateTable('two_factors')
        .set({
          isVerified: 1,
          verifiedAt: now,
          lastUsedAt: now,
          updatedAt: now,
        })
        .where('id', '=', twoFactor.id)
        .execute()
    } else {
      // Just update last used timestamp
      await db
        .updateTable('two_factors')
        .set({
          lastUsedAt: now,
          updatedAt: now,
        })
        .where('id', '=', twoFactor.id)
        .execute()
    }

    await auditLog(event, {
      action: 'verify',
      entity: 'two_factor',
      entityId: body.id,
      metadata: {
        success: true,
        userId: payload.sub,
      },
    })

    return createSuccessResponse<IVerifyTOTPResponse>(event, 'TOTP verification successful', {
      verification: {
        id: twoFactor.id,
        type: 'totp',
        isVerified: true,
        verifiedAt: toISOString(now),
        lastUsedAt: toISOString(now),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
