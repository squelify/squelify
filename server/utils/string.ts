import { hash, verify } from '@node-rs/argon2'
import { env } from 'std-env'

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
