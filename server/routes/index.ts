export default defineEventHandler(async (event) => {
  setResponseHeader(event, 'Content-Type', 'text/plain')
  return send(event, `Nothing to see here.`)
})
