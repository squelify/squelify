import { z } from 'zod'

export interface IRemovePasskeyResponse {
  passkey: {
    id: string
    name: string
    credentialId: string
    removedAt: string
  }
}

const RemovePasskeySchema = z
  .object({
    credentialId: z.string({ required_error: 'Credential ID is required' }),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, RemovePasskeySchema)

    const passkey = await db
      .selectFrom('sq_passkeys')
      .where('credentialId', '=', body.credentialId)
      .where('userId', '=', userId)
      .select(['id', 'name', 'credentialId'])
      .executeTakeFirst()

    if (!passkey) {
      await auditLog(event, {
        action: 'delete',
        entity: 'passkey',
        entityId: body.credentialId,
        metadata: {
          success: false,
          reason: 'passkey_not_found',
          credentialId: body.credentialId,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Passkey not found', 404)
    }

    const passkeyCount = await db
      .selectFrom('sq_passkeys')
      .where('userId', '=', userId)
      .select((eb) => eb.fn.count('id').as('count'))
      .executeTakeFirst()

    if (Number(passkeyCount?.count) === 1) {
      await auditLog(event, {
        action: 'delete',
        entity: 'passkey',
        entityId: passkey.id,
        metadata: {
          success: false,
          reason: 'last_passkey',
          name: passkey.name,
          credentialId: passkey.credentialId,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Cannot remove last passkey', 400)
    }

    await db.deleteFrom('sq_passkeys').where('id', '=', passkey.id).execute()

    await auditLog(event, {
      action: 'delete',
      entity: 'passkey',
      entityId: passkey.id,
      metadata: {
        success: true,
        name: passkey.name,
        credentialId: passkey.credentialId,
        deletedBy: {
          id: userId,
          email: userEmail,
        },
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IRemovePasskeyResponse>(event, 'Passkey removed successfully', {
      passkey: {
        id: passkey.id,
        name: passkey.name,
        credentialId: passkey.credentialId,
        removedAt: toISOString(now),
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
