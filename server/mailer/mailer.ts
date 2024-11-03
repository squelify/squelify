import appConfig from '~/app.config'
import MagicLink, { type MagicLinkProps } from '~/mailer/templates/magic-link'
import OnboardingEmail, { type OnboardingEmailProps } from '~/mailer/templates/onboarding'
import OtpCode, { type OtpCodeProps } from '~/mailer/templates/otp-code'
import type { PasswordChangedEmailProps } from '~/mailer/templates/password-changed'
import PasswordChangedEmail from '~/mailer/templates/password-changed'
import ResetPassword, { type ResetPasswordEmailProps } from '~/mailer/templates/reset-password'
import VerifyEmail, { type VerifyEmailProps } from '~/mailer/templates/verify-email'

const EmailTemplates = {
  VerifyEmail,
  OnboardingEmail,
  MagicLink,
  OtpCode,
  ResetPassword,
  PasswordChangedEmail,
} as const

export type EmailTemplateProps =
  | VerifyEmailProps
  | OnboardingEmailProps
  | MagicLinkProps
  | OtpCodeProps
  | ResetPasswordEmailProps
  | PasswordChangedEmailProps

/**
 * Email template configuration mapping
 */
export const EMAIL_CONFIG = {
  'verify-email': {
    template: EmailTemplates.VerifyEmail,
    subject: 'Confirm your email address',
  },
  onboarding: {
    template: EmailTemplates.OnboardingEmail,
    subject: `Welcome to ${appConfig.title}`,
  },
  'magic-link': {
    template: EmailTemplates.MagicLink,
    subject: `Sign in to ${appConfig.title}`,
  },
  'otp-code': {
    template: EmailTemplates.OtpCode,
    subject: `Your ${appConfig.title} OTP Code`,
  },
  'reset-password': {
    template: EmailTemplates.ResetPassword,
    subject: `Reset your ${appConfig.title} password`,
  },
  'password-changed': {
    template: EmailTemplates.PasswordChangedEmail,
    subject: `Your ${appConfig.title} password has been changed`,
  },
} as const

export type EmailKind = keyof typeof EMAIL_CONFIG
