export default eventHandler(async (event) => {
  const users = await event.context.db.selectFrom('users').selectAll().execute()

  if (!users) {
    return createErrorResponse(400, 'No user found')
  }

  return {
    statusCode: 200,
    message: null,
    data: users,
  }
})
