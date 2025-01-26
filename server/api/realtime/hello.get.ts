export default defineEventHandler(async (event) => {
  const eventStream = createEventStream(event)

  const interval = setInterval(async () => {
    const data = JSON.stringify({ message: `Timestamp @ ${new Date().toLocaleTimeString()}` })
    await eventStream.push(data)
  }, 1000)

  eventStream.onClosed(async () => {
    clearInterval(interval)
    await eventStream.close()
  })

  return eventStream.send()
})
