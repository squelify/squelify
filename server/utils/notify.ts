// TODO! JSX Email causing increase in bundle size

import { render } from 'jsx-email'
import { env, isDevelopment } from 'std-env'
import { EMAIL_CONFIG, type EmailKind, type EmailTemplateProps } from '~/mailer/mailer'
import smtpTransport from '~/mailer/transport'

/**
 * Sends an email using the provided email template and data.
 *
 * @param kind - The type of email to send, defined in the `EmailKind` type.
 * @param to - The email address to send the email to.
 * @param data - The data to be used in the email template, defined by the `EmailTemplateProps` type.
 * @returns A Promise that resolves when the email has been sent.
 */
export async function sendJSXEmail<T extends EmailTemplateProps>(
  kind: EmailKind,
  to: string,
  data: T
): Promise<void> {
  const config = EMAIL_CONFIG[kind]
  const Template = config.template(data as any)

  const fromName = cleanString(env.SMTP_EMAIL_FROM_NAME)
  const fromEmail = cleanString(env.SMTP_EMAIL_FROM_EMAIL)
  const from = `${fromName} <${fromEmail}>`
  const subject = config.subject

  const html = await render(Template, {
    pretty: isDevelopment,
    plainText: false,
  })

  await smtpTransport.sendMail({ to, subject, from, html })
}

export async function sendRawEmail(kind: EmailKind, to: string, content: string): Promise<void> {
  const config = EMAIL_CONFIG[kind]

  const fromName = cleanString(env.SMTP_EMAIL_FROM_NAME)
  const fromEmail = cleanString(env.SMTP_EMAIL_FROM_EMAIL)
  const from = `${fromName} <${fromEmail}>`
  const subject = config.subject

  await smtpTransport.sendMail({ to, subject, from, text: content })
}
