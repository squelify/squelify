import { handleBypassCache } from '~/utils/cache'
import { DURATION } from '~/utils/datetime'

export default defineCachedEventHandler(
  async (event) => {
    setResponseHeader(event, 'Content-Type', 'text/plain')
    return send(event, `User-Agent: *\nAllow: /`)
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: DURATION.MONTH,
  }
)
