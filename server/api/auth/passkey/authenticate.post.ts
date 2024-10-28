export default defineEventHandler(async (event) => {
  try {
    await requireAuth(event)
    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
