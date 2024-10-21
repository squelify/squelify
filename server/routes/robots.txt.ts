export default defineCachedEventHandler(
  async (event) => {
    setResponseHeader(event, 'Content-Type', 'text/plain')
    return send(
      event,
      `User-Agent: *
Allow: /
Sitemap: https://example.com/sitemap.xml
`
    )
  },
  {
    shouldBypassCache: (e) => e.node.req.url.includes('preview'),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
