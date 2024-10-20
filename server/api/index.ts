export default defineCachedEventHandler(
  async (event) => {
    return {
      path: event.path,
      message: 'API Endpoint',
    }
  },
  {
    shouldBypassCache: (e) => e.node.req.url.includes('preview'),
  }
)
