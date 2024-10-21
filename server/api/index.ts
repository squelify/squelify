import type { Repo } from '~/types/repo'

export default defineCachedEventHandler(
  async ({ path }) => {
    const { repos } = await $fetch<Repo>('https://ungh.cc/orgs/unjs/repos')
    return { path, repos }
  },
  {
    shouldBypassCache: (e) => e.node.req.url.includes('preview'),
    maxAge: 60 * 60 /* 1 hour */,
  }
)
