export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const orgId = event.context.params.id

    // Check if organization exists
    const org = await db
      .selectFrom('organizations')
      .where('id', '=', orgId)
      .select(['id', 'name'])
      .executeTakeFirst()

    if (!org) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'Organisasi tidak ditemukan')
    }

    // Delete organization (cascade will handle related records)
    await db.deleteFrom('organizations').where('id', '=', orgId).execute()

    return {
      status: 200,
      success: true,
      message: `Organisasi ${org.name} berhasil dihapus`,
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
