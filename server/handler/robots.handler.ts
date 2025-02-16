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

defineRouteMeta({
  openAPI: {
    summary: 'robots.txt',
    tags: ['Miscellaneous'],
    parameters: [],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
