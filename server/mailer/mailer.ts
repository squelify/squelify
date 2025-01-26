import MagicLink, { type MagicLinkProps } from '~/mailer/templates/magic-link'
import OnboardingEmail, { type OnboardingEmailProps } from '~/mailer/templates/onboarding'
import OtpCode, { type OtpCodeProps } from '~/mailer/templates/otp-code'
import type { PasswordChangedEmailProps } from '~/mailer/templates/password-changed'
import PasswordChangedEmail from '~/mailer/templates/password-changed'
import ResetPassword, { type ResetPasswordEmailProps } from '~/mailer/templates/reset-password'
import VerifyEmail, { type VerifyEmailProps } from '~/mailer/templates/verify-email'
import pkg from '~~/package.json'

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
    subject: `Welcome to ${pkg.config.appName}`,
  },
  'magic-link': {
    template: EmailTemplates.MagicLink,
    subject: `Sign in to ${pkg.config.appName}`,
  },
  'otp-code': {
    template: EmailTemplates.OtpCode,
    subject: `Your ${pkg.config.appName} OTP Code`,
  },
  'reset-password': {
    template: EmailTemplates.ResetPassword,
    subject: `Reset your ${pkg.config.appName} password`,
  },
  'password-changed': {
    template: EmailTemplates.PasswordChangedEmail,
    subject: `Your ${pkg.config.appName} password has been changed`,
  },
} as const

export type EmailKind = keyof typeof EMAIL_CONFIG
