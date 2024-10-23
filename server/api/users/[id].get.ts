export default eventHandler(async (event) => {
  try {
    const userId = event.context.params.id
    const user = await event.context.db
      .selectFrom('users')
      .where('id', '=', userId)
      .selectAll()
      .executeTakeFirst()

    if (!user) {
      return createErrorResponse(400, 'No user found')
    }

    return {
      statusCode: 200,
      message: null,
      data: user,
    }
  } catch (error) {
    return throwErrorResponse(error, 400)
  }
})
