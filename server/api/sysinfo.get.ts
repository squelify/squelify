export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event)

  const interval = setInterval(async () => {
    const data = JSON.stringify({ message: `Timestamp @ ${new Date().toLocaleTimeString()}` })
    await eventStream.push(data)
  }, 10_000 /* 10 seconds */)

  eventStream.onClosed(async () => {
    clearInterval(interval)
    await eventStream.close()
  })

  return eventStream.send()
})

defineRouteMeta({
  openAPI: {
    summary: 'System Resources',
    tags: ['Internal'],
    parameters: [
      {
        in: 'header',
        name: 'Content-Type',
        required: true,
        example: 'application/json',
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
    $global: {
      components: {},
    },
  },
})
