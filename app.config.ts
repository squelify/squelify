import { env } from 'std-env'

const appConfig = {
  baseURL: env.SQUELIFY_BASE_URL || 'http://localhost:3278',
  domain: 'localhost:3278',
  adminPath: '/admin',
  title: 'Squelify',
  description: 'Lightweight Headless CMS and Backend Platform without hassle',
  imageUrl: '/images/og-image.png',
  twitterUsername: '@riipandi',
  authorEmail: 'hi@squelify.com',
  address: 'The Internet',
  socials: {
    github: 'https://github.com/squelify',
    twitter: 'https://x.com/squelify',
  },
}

export type AppConfig = typeof appConfig

export default appConfig
