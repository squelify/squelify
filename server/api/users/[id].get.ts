export default eventHandler(({ context }) => {
  return { userId: context.params.id, message: 'Single user endpoint' }
})
