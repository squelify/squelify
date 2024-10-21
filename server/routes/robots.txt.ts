import type { AppConfig } from '~/config'

export default defineCachedEventHandler(
  async (event) => {
    const appConfig = useAppConfig(event) as AppConfig

    setResponseHeader(event, 'Content-Type', 'text/plain')

    return send(event, `User-Agent: *\nAllow: /\nSitemap: ${appConfig.baseURL}/sitemap.xml`)
  },
  {
    shouldBypassCache: (e) => e.node.req.url.includes('preview'),
    maxAge: 60 * 60 * 12 * 30 /* 1 month */,
  }
)
