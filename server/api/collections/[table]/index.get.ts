export default defineCachedEventHandler(
  async (_event) => {
    return {
      message: 'Not yet implemented!',
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
