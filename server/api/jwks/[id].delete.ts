export default defineEventHandler(async (event) => {
  const db = event.context.db
  const jwkId = event.context.params.id

  try {
    // Get JWK record first
    const jwk = await db
      .selectFrom('jwks')
      .where('id', '=', jwkId)
      .select(['id', 'keyId', 'isActive'])
      .executeTakeFirst()

    if (!jwk) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'JWK not found')
    }

    // Cannot delete active JWK for security reasons
    if (jwk.isActive) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Cannot delete active JWK')
    }

    // Delete the JWK record
    await db.deleteFrom('jwks').where('id', '=', jwkId).execute()

    return {
      status: 200,
      success: true,
      message: 'JWK deleted successfully',
      data: {
        id: jwk.id,
        keyId: jwk.keyId,
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})

defineRouteMeta({
  openAPI: {
    summary: 'Delete a JWK',
    tags: ['Administration'],
  },
})
