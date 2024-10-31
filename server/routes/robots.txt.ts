export default defineCachedEventHandler(
  async (event) => {
    const appConfig = event.context.appConfig

    setResponseHeader(event, 'Content-Type', 'text/plain')

    return send(event, `User-Agent: *\nAllow: /\nSitemap: ${appConfig.baseURL}/sitemap.xml`)
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 * 12 * 30 /* 1 month */,
  }
)
