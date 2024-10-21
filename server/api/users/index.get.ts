export default eventHandler(({ path, context }) => {
  return {
    path,
    message: 'Users Endpoint',
    name: context.auth.name,
  }
})
