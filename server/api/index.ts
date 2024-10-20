import { eventHandler } from 'h3'

export default eventHandler((event) => {
  return {
    path: event.path,
    message: 'API Endpoint',
  }
})
