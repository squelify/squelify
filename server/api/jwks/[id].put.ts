export default defineEventHandler(async (_event) => {
  try {
    return { message: 'Not yet implemented' }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
