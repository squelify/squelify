import { z } from 'zod'

const RemovePasskeySchema = z.object({
  credentialId: z.string(),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email

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
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Passkey not found')
    }

    // Check if this is the last passkey
    const passkeyCount = await db
      .selectFrom('passkeys')
      .where('userId', '=', userId)
      .select((eb) => eb.fn.count('id').as('count'))
      .executeTakeFirst()

    if (Number(passkeyCount?.count) === 1) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Cannot remove last passkey')
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

    return {
      status: 200,
      success: true,
      message: 'Passkey removed successfully',
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
