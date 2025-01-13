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
  const payload = event.context.auth?.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, RecoverySchema)
    const now = Math.floor(Date.now() / 1000)

    const twoFactor = await db
      .selectFrom('sq_two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .select(['id', 'name', 'type', 'verifiedAt', 'backupCodes', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      await auditLog(event, {
        action: 'recovery',
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
        action: 'recovery',
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

    let backupCodes: string[]
    try {
      backupCodes = JSON.parse(JSON.stringify(twoFactor.backupCodes))
      if (!Array.isArray(backupCodes)) {
        throw new Error('Invalid backup codes format')
      }
    } catch {
      await auditLog(event, {
        action: 'recovery',
        entity: 'two_factor',
        entityId: body.id,
        metadata: {
          success: false,
          reason: 'invalid_backup_codes',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Invalid backup codes format', 500)
    }

    if (backupCodes.length === 0) {
      await auditLog(event, {
        action: 'recovery',
        entity: 'two_factor',
        entityId: body.id,
        metadata: {
          success: false,
          reason: 'no_backup_codes',
        },
        retention: 'CRITICAL',
      })
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
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Invalid or used recovery code', 400)
    }

    backupCodes.splice(codeIndex, 1)

    await db
      .updateTable('sq_two_factors')
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
      retention: 'CRITICAL',
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
