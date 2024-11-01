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
 * Scrypt configuration parameters
 * Can be configured via environment variables:
 * - SCRYPT_N_FACTOR: CPU/memory cost factor (power of 2)
 * - SCRYPT_R_FACTOR: Block size factor
 * - SCRYPT_P_FACTOR: Parallelization factor
 * - SCRYPT_KEY_LENGTH: Output key length in bytes
 */
const SCRYPT_PARAMS = {
  // High security for powerful servers
  SECURE: {
    N: Number.parseInt(env.SCRYPT_N_FACTOR_SECURE || '32768'), // 2^15
    r: Number.parseInt(env.SCRYPT_R_FACTOR_SECURE || '8'),
    p: Number.parseInt(env.SCRYPT_P_FACTOR_SECURE || '2'),
    dkLen: Number.parseInt(env.SCRYPT_KEY_LENGTH || '32'),
  },
  // Balanced for standard servers
  BALANCED: {
    N: Number.parseInt(env.SCRYPT_N_FACTOR_BALANCED || '16384'), // 2^14
    r: Number.parseInt(env.SCRYPT_R_FACTOR_BALANCED || '8'),
    p: Number.parseInt(env.SCRYPT_P_FACTOR_BALANCED || '1'),
    dkLen: Number.parseInt(env.SCRYPT_KEY_LENGTH || '32'),
  },
  // Fast for development or low-power devices
  FAST: {
    N: Number.parseInt(env.SCRYPT_N_FACTOR_FAST || '4096'), // 2^12
    r: Number.parseInt(env.SCRYPT_R_FACTOR_FAST || '8'),
    p: Number.parseInt(env.SCRYPT_P_FACTOR_FAST || '1'),
    dkLen: Number.parseInt(env.SCRYPT_KEY_LENGTH || '32'),
  },
} as const

/**
 * Get Scrypt parameters based on environment and server memory
 */
function getScryptParams() {
  // Override with explicit environment setting
  const mode = env.SCRYPT_MODE?.toUpperCase()
  if (mode && mode in SCRYPT_PARAMS) {
    return SCRYPT_PARAMS[mode as keyof typeof SCRYPT_PARAMS]
  }

  // Auto-select based on environment and memory
  if (env.dev) return SCRYPT_PARAMS.FAST

  const memory = process.memoryUsage().heapTotal / 1024 / 1024 // MB
  return memory > 1024 ? SCRYPT_PARAMS.SECURE : SCRYPT_PARAMS.BALANCED
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

export function generateUsername(email: string): string {
  const baseUsername = email
    .split('@')[0]
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '')

  const uniqueChars = Math.random().toString(36).substring(2, 6)

  return `${baseUsername}${uniqueChars}`
}
