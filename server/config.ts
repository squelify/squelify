export interface AppConfig {
  baseURL: string
  domain: string
  title: string
}

export default {
  baseURL: 'http://localhost:3000',
  domain: 'localhost:3000',
  title: 'Nitro Start',
} satisfies AppConfig
