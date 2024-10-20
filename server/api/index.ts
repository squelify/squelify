export default defineCachedEventHandler(
  async ({ path }) => {
    return { path, message: 'API Endpoint' }
  },
  { shouldBypassCache: (e) => e.node.req.url.includes('preview') }
)
