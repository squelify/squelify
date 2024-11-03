import { z } from 'zod'

export interface IRecoveryResponse {
  recovery: {
    id: string
    name: string
    type: string
    remainingCodes: number
    lastUsedAt: string
    recoveredAt: string
  }
}

const RecoverySchema = z
  .object({
    id: z.string({ required_error: 'Authenticator ID is required' }),
    code: z.string().length(8, 'Recovery code must be 8 characters'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, RecoverySchema)
    const now = Math.floor(Date.now() / 1000)

    // Get 2FA record with complete status check
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .select(['id', 'name', 'type', 'isVerified', 'backupCodes', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(event, 'Authenticator not found', 404)
    }

    if (!twoFactor.isVerified) {
      return createErrorResponse(event, 'Authenticator is not verified', 400)
    }

    // Parse and verify backup codes
    let backupCodes: string[]

    try {
      backupCodes = JSON.parse(JSON.stringify(twoFactor.backupCodes))

      if (!Array.isArray(backupCodes)) {
        throw new Error('Invalid backup codes format')
      }
    } catch {
      return createErrorResponse(event, 'Invalid backup codes format', 500)
    }

    if (backupCodes.length === 0) {
      return createErrorResponse(event, 'No backup codes available', 400)
    }

    const codeIndex = backupCodes.indexOf(body.code)
    if (codeIndex === -1) {
      await auditLog(event, {
        action: 'recovery',
        entity: 'two_factor',
        entityId: body.id,
        metadata: {
          success: false,
          reason: 'invalid_code',
          userId: payload.sub,
        },
      })

      return createErrorResponse(event, 'Invalid or used recovery code', 400)
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1)

    // Update backup codes and usage info
    await db
      .updateTable('two_factors')
      .set({
        backupCodes: JSON.stringify(backupCodes),
        lastUsedAt: now,
        updatedAt: now,
      })
      .where('id', '=', twoFactor.id)
      .execute()

    await auditLog(event, {
      action: 'recovery',
      entity: 'two_factor',
      entityId: body.id,
      metadata: {
        success: true,
        userId: payload.sub,
        remainingCodes: backupCodes.length,
      },
    })

    return createSuccessResponse<IRecoveryResponse>(
      event,
      `Recovery successful for authenticator '${twoFactor.name}'`,
      {
        recovery: {
          id: twoFactor.id,
          name: twoFactor.name,
          type: twoFactor.type,
          remainingCodes: backupCodes.length,
          lastUsedAt: toISOString(now),
          recoveredAt: toISOString(now),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
