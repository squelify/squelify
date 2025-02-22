import { env } from 'std-env'

// Alloed domains for CORS
const allowedCorsDomains = {
  LOCAL: ['localhost', '127.0.0.1'],
  STAGING: ['staging.example.com'],
  TESTING: ['testing.example.com'],
  PRODUCTION: ['example.com', 'app.example.com'],
}

const appConfig = {
  logLevel: env.SQUELIFY_LOG_LEVEL || 'debug',
  baseURL: env.SQUELIFY_BASE_URL || 'http://localhost:3278',
  domain: env.SQUELIFY_DOMAIN || 'localhost:3278',
  adminPath: '/admin',
  allowedCorsDomains,
}

export type AppConfig = typeof appConfig

export default appConfig
