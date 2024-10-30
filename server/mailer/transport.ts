import { createTransport } from 'nodemailer'
import { env, isDevelopment } from 'std-env'

/**
 * Sometimes nodemailer has issue `No overload matches this call`.
 * @ref: https://github.com/nodemailer/nodemailer/issues/1075#issuecomment-907415649
 */
export default createTransport({
  host: String(env.SMTP_HOST),
  port: Number(env.SMTP_PORT),
  auth: {
    user: env.SMTP_USERNAME,
    pass: env.SMTP_PASSWORD,
  },
  // Use `true` for port 465, `false` for all other ports
  secure: Number(env.SMTP_PORT) === 465,
  // Integrate with application logger, make sure not called via cli.
  logger: import.meta.url === `file://${process.argv[1]}` && {
    level: (_level: string) => {}, // Not implemented
    trace: (...params: any[]) => logger.debug('[mailer]', ...params),
    debug: (...params: any[]) => logger.debug('[mailer]', ...params),
    info: (...params: any[]) => logger.info('[mailer]', ...params),
    warn: (...params: any[]) => logger.warn('[mailer]', ...params),
    error: (...params: any[]) => logger.error('[mailer]', ...params),
    fatal: (...params: any[]) => logger.error('[mailer]', ...params),
  },
  debug: isDevelopment,
})
