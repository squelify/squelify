import { scrypt } from '@noble/hashes/scrypt'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils'
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
 * Scrypt configuration parameters for password hashing.
 * Can be configured via environment variable SCRYPT_MODE:
 * - SECURE: Server 4+ cores, 2GB+ RAM (High-end cloud/dedicated)
 * - BALANCED: Server 2+ cores, 512MB+ RAM (Standard VPS/cloud)
 * - FAST: Server 1+ core, 128MB+ RAM (Development/low-end VPS)
 */
const SCRYPT_PARAMS = {
  // High security for powerful servers
  SECURE: {
    N: Number.parseInt(env.SCRYPT_N_FACTOR_SECURE || '65536'), // CPU/memory cost (2^16)
    r: Number.parseInt(env.SCRYPT_R_FACTOR_SECURE || '8'), // Block size factor
    p: Number.parseInt(env.SCRYPT_P_FACTOR_SECURE || '1'), // Parallelization factor
    dkLen: Number.parseInt(env.SCRYPT_KEY_LENGTH || '32'), // Output key length in bytes
  },
  // Balanced for standard servers
  BALANCED: {
    N: Number.parseInt(env.SCRYPT_N_FACTOR_BALANCED || '4096'), // CPU/memory cost (2^12)
    r: Number.parseInt(env.SCRYPT_R_FACTOR_BALANCED || '8'), // Block size factor
    p: Number.parseInt(env.SCRYPT_P_FACTOR_BALANCED || '1'), // Parallelization factor
    dkLen: Number.parseInt(env.SCRYPT_KEY_LENGTH || '32'), // Output key length in bytes
  },
  // Fast for development or low-end servers
  FAST: {
    N: Number.parseInt(env.SCRYPT_N_FACTOR_FAST || '1024'), // CPU/memory cost (2^10)
    r: Number.parseInt(env.SCRYPT_R_FACTOR_FAST || '8'), // Block size factor
    p: Number.parseInt(env.SCRYPT_P_FACTOR_FAST || '1'), // Parallelization factor
    dkLen: Number.parseInt(env.SCRYPT_KEY_LENGTH || '32'), // Output key length in bytes
  },
} as const

/**
 * Get Scrypt parameters based on environment and server memory
 */
function getScryptParams() {
  const mode = env.SCRYPT_MODE?.toUpperCase() || 'FAST'
  return SCRYPT_PARAMS[mode as keyof typeof SCRYPT_PARAMS] || SCRYPT_PARAMS.FAST
}

/**
 * Hashes password using Scrypt with adaptive parameters
 */
export async function hashPassword(password: string): Promise<string> {
  const salt = bytesToHex(randomBytes(16))
  const params = getScryptParams()

  const { N, r, p } = params
  const paramsStr = `${N}.${r}.${p}`

  const hash = scrypt(new TextEncoder().encode(password), hexToBytes(salt), params)

  return `${paramsStr}.${salt}.${bytesToHex(hash)}`
}

/**
 * Verifies password using stored parameters
 */
export async function verifyPassword(password: string, hashedPassword: string): Promise<boolean> {
  const [N, r, p, salt, hash] = hashedPassword.split('.')

  const params = {
    N: Number.parseInt(N),
    r: Number.parseInt(r),
    p: Number.parseInt(p),
    dkLen: 32,
  }

  const newHash = scrypt(new TextEncoder().encode(password), hexToBytes(salt), params)

  return bytesToHex(newHash) === hash
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
  const bytes = randomBytes(size)

  let result = ''
  for (let i = 0; i < size; i++) {
    result += allowedChars[bytes[i] % allowedChars.length]
  }
  return result
}

export function generateUsername(email: string, suffix?: string): string {
  const baseUsername = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  return suffix ? `${baseUsername}_${suffix}` : baseUsername
}
