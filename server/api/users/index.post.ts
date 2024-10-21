export default defineEventHandler(async (event) => {
  const body = await readBody<{ name: string }>(event)
  return { name: body.name }
})
