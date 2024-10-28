import { hash, verify } from '@node-rs/argon2'
import { env } from 'std-env'
import { getRandomValues } from 'uncrypto'

/**
 * Cleans a string by performing the following operations:
 * - Trims leading and trailing whitespace
 * - Removes single quotes, double quotes, and backticks
 * - Removes angle brackets (< and >)
 * - Replaces multiple consecutive spaces with a single space
 *
 * @param str - The input string to be cleaned
 * @returns The cleaned string
 */
export function cleanString(str: string): string {
  return str
    .trim()
    .replace(/[\r\n\t]/g, '') // Removes newlines and tabs
    .replace(/ {2,}/g, ' ') // Replace multiple spaces with a single space
    .replace(/['""`<>]/g, '') // Remove quotes and < > characters
}

/**
 * Hashes a password using the Argon2 algorithm with a secret key.
 *
 * @param password - The plaintext password to be hashed.
 * @returns A Promise that resolves to the hashed password.
 */
export async function hashPassword(password: string): Promise<string> {
  return hash(password, {
    secret: Buffer.from(env.JWT_SECRET_KEY, 'base64'),
  })
}

/**
 * Verifies a password against a hashed password using the Argon2 algorithm and a secret key.
 *
 * @param hash - The hashed password to verify against.
 * @param password - The plaintext password to verify.
 * @returns A Promise that resolves to `true` if the password is valid, `false` otherwise.
 */
export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return await verify(hash, password, {
    secret: Buffer.from(env.JWT_SECRET_KEY, 'base64'),
  })
}

/**
 * Generates a cryptographically secure random key with specified length
 * Uses uncrypto which provides isomorphic crypto API
 */
interface RandomStringOptions {
  size?: number
  pattern?: string
  digitsOnly?: boolean
  includeLower?: boolean
  includeUpper?: boolean
  includeSpecial?: boolean
}

export function generateRandomStr(config: RandomStringOptions = {}): string {
  const digits = '0123456789'
  const lowerChars = 'abcdefghijklmnopqrstuvwxyz'
  const upperChars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'
  const specialChars = '!@#$%^&*()_+-=[]{}|;:,.<>?'

  let allowedChars = lowerChars + upperChars + digits

  if (config.pattern) allowedChars = config.pattern
  if (config.digitsOnly) allowedChars = digits
  if (config.includeLower === false) allowedChars = allowedChars.replace(lowerChars, '')
  if (config.includeUpper === false) allowedChars = allowedChars.replace(upperChars, '')
  if (config.includeSpecial) allowedChars += specialChars

  const size = config.size || 10
  const bytes = new Uint8Array(size)
  getRandomValues(bytes)

  let result = ''
  for (let i = 0; i < size; i++) {
    result += allowedChars[bytes[i] % allowedChars.length]
  }
  return result
}

export function generateUsername(email: string): string {
  const baseUsername = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  const uniqueChars = Math.random().toString(36).substring(2, 6)

  return `${baseUsername}${uniqueChars}`
}
