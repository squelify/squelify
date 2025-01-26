import { env } from 'std-env'

const appConfig = {
  logLevel: env.SQUELIFY_LOG_LEVEL || 'debug',
  baseURL: env.SQUELIFY_BASE_URL || 'http://localhost:3278',
  domain: env.SQUELIFY_DOMAIN || 'localhost:3278',
  adminPath: '/admin',
  title: 'Squelify',
}

export type AppConfig = typeof appConfig

export default appConfig
