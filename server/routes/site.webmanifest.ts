export default defineCachedEventHandler(
  async (event) => {
    const appConfig = event.context.appConfig

    setResponseHeader(event, 'Content-Type', 'application/json')

    return {
      lang: 'en',
      dir: 'ltr',
      name: 'Squelify',
      short_name: 'squelify',
      description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit sed do eiusmod aliqua',
      theme_color: '#2563eb',
      background_color: '#0c0a09',
      start_url: `${appConfig.baseURL}/?source=pwa`,
      id: `${appConfig.baseURL}/?source=pwa`,
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
    maxAge: 60 * 60 * 12 * 7 /* 7 days */,
  }
)
