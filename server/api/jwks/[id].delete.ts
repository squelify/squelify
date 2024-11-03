export interface IDeleteJWKResponse {
  jwk: {
    id: string
    keyId: string
  }
}

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const jwkId = event.context.params.id
  const userId = event.context.auth.payload.sub
  const userEmail = event.context.auth.payload.email

  try {
    // Get JWK record first
    const jwk = await db
      .selectFrom('jwks')
      .where('id', '=', jwkId)
      .select(['id', 'keyId', 'isActive'])
      .executeTakeFirst()

    if (!jwk) {
      return createErrorResponse(event, 'JWK not found', 404)
    }

    // Cannot delete active JWK for security reasons
    if (jwk.isActive) {
      await auditLog(event, {
        action: 'delete',
        entity: 'jwk',
        entityId: jwkId,
        metadata: {
          success: false,
          reason: 'active_jwk_deletion_prevented',
          keyId: jwk.keyId,
          deletedBy: {
            id: userId,
            email: userEmail,
          },
        },
      })

      return createErrorResponse(event, 'Cannot delete active JWK', 400)
    }

    // Delete the JWK record
    await db.deleteFrom('jwks').where('id', '=', jwkId).execute()

    // Log successful deletion
    await auditLog(event, {
      action: 'delete',
      entity: 'jwk',
      entityId: jwkId,
      metadata: {
        success: true,
        keyId: jwk.keyId,
        deletedBy: {
          id: userId,
          email: userEmail,
        },
      },
    })

    return createSuccessResponse<IDeleteJWKResponse>(event, 'JWK deleted successfully', {
      jwk: {
        id: jwk.id,
        keyId: jwk.keyId,
      },
    })
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Delete a JWK',
    tags: ['Administration'],
  },
})
