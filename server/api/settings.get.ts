import { env } from 'std-env'
import { DURATION } from '~/utils/datetime'

export default defineCachedEventHandler(
  async (_event) => {
    return {
      external: {
        github: Boolean(env.GITHUB_CLIENT_ID),
        google: Boolean(env.GOOGLE_CLIENT_ID),
      },
      registration: {
        enabled: true,
        autoConfirm: false,
      },
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: DURATION.HOUR,
  },
)

defineRouteMeta({
  openAPI: {
    summary: 'API Settings',
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
