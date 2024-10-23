export interface AppConfig {
  baseURL: string
  domain: string
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
  baseURL: 'http://localhost:3000',
  domain: 'localhost:3000',
  title: 'Nitro Start',
  description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
  imageUrl: '/images/og-image.png',
  twitterUsername: '@riipandi',
  authorEmail: 'aris@duck.com',
  address: 'The Internet',
  socials: {
    github: 'https://github.com/riipandi',
    twitter: 'https://twitter.com/riipandi',
    linkedin: 'https://www.linkedin.com/in/aris-ripandi/',
  },
} satisfies AppConfig
