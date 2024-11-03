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

    // Get passkey
    const passkey = await db
      .selectFrom('passkeys')
      .where('credentialId', '=', body.credentialId)
      .where('userId', '=', userId)
      .select(['id', 'name', 'credentialId'])
      .executeTakeFirst()

    if (!passkey) {
      return createErrorResponse(event, 'Passkey not found', 404)
    }

    // Check if this is the last passkey
    const passkeyCount = await db
      .selectFrom('passkeys')
      .where('userId', '=', userId)
      .select((eb) => eb.fn.count('id').as('count'))
      .executeTakeFirst()

    if (Number(passkeyCount?.count) === 1) {
      return createErrorResponse(event, 'Cannot remove last passkey', 400)
    }

    // Delete passkey
    await db.deleteFrom('passkeys').where('id', '=', passkey.id).execute()

    // Log passkey removal
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
