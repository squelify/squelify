import { env } from 'std-env'

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
    maxAge: 60 * 60 /* 1 hour */,
  }
)

defineRouteMeta({
  openAPI: {
    summary: 'API Settings',
    tags: ['General'],
    parameters: [
      {
        in: 'header',
        name: 'Contennt-Type',
        required: true,
        example: 'application/json',
      },
    ],
    responses: {
      200: { $ref: 'resp-ok' },
      400: { $ref: 'resp-bad-request' },
      500: { $ref: 'resp-internal-server-error' },
    },
  },
})
