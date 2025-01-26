import { handleBypassCache } from '~/utils/cache'
import { DURATION } from '~/utils/datetime'

export default defineCachedEventHandler(
  async (event) => {
    const appConfig = event.context.appConfig
    const startUrl = `${appConfig.baseURL}${appConfig.adminPath}?source=pwa`

    setResponseHeader(event, 'Content-Type', 'application/json')

    return {
      lang: 'en',
      dir: 'ltr',
      name: appConfig.title,
      short_name: appConfig.title.toLowerCase(),
      description: 'Lightweight Headless CMS and Backend Platform without hassle',
      theme_color: '#0a0a0a',
      background_color: '#0a0a0a',
      start_url: startUrl,
      id: startUrl,
      icons: [
        {
          src: '/favicon.svg',
          sizes: '36x36',
          type: 'image/svg+xml',
          density: '0.75',
        },
        {
          src: '/favicon.svg',
          sizes: '48x48',
          type: 'image/svg+xml',
          density: '1.0',
        },
        {
          src: '/favicon.svg',
          sizes: '72x72',
          type: 'image/svg+xml',
          density: '1.5',
        },
        {
          src: '/favicon.svg',
          sizes: '96x96',
          type: 'image/svg+xml',
          density: '2.0',
        },
        {
          src: '/favicon.svg',
          sizes: '144x144',
          type: 'image/svg+xml',
          density: '3.0',
        },
        {
          src: '/favicon.svg',
          sizes: '192x192',
          type: 'image/svg+xml',
          density: '4.0',
        },
      ],
      display: 'standalone',
      orientation: 'natural',
    }
  },
  {
    shouldBypassCache: (e) => handleBypassCache(e),
    maxAge: DURATION.MONTH * 6,
  }
)
