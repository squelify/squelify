import { env } from 'std-env'

const appConfig = {
  baseURL: env.APP_BASE_URL || 'http://localhost:3278',
  title: 'Nitro Application',
  description: 'Build fast and modern web applications with Nitro',
}

export type AppConfig = typeof appConfig

export default appConfig
