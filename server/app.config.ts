import { env } from 'std-env'

export interface AppConfig {
  baseURL: string
  domain: string
  adminPath: string
  title: string
  description: string
  imageUrl: string
  twitterUsername: string
  authorEmail: string
  address: string
  socials: {
    github: string
    twitter: string
    linkedin: string
  }
}

export default {
  baseURL: 'http://localhost:3278',
  domain: 'localhost:3278',
  adminPath: '/_admin_',
  title: 'Squelify',
  description: 'Lightweight Headless CMS and Backend Platform without hassle',
  imageUrl: '/images/og-image.png',
  twitterUsername: '@riipandi',
  authorEmail: 'hi@squelify.com',
  address: 'The Internet',
  socials: {
    github: 'https://github.com/riipandi',
    twitter: 'https://twitter.com/riipandi',
    linkedin: 'https://www.linkedin.com/in/aris-ripandi/',
  },
} satisfies AppConfig
