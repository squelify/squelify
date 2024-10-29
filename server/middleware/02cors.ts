export default defineEventHandler((event) => {
  const didHandleCors = handleCors(event, {
    preflight: { statusCode: 204 },
    origin: '*',
    methods: '*',
  })
  if (didHandleCors) {
    return
  }
})
