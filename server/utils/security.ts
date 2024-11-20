import { argon2id } from '@noble/hashes/argon2'
import { scryptAsync } from '@noble/hashes/scrypt'
import { bytesToHex, hexToBytes, randomBytes } from '@noble/hashes/utils'
import { env } from 'std-env'
import { PasswordAlgorithm, passwordAlgorithmEnum } from '~/database/schemas/password'

// Cache TextEncoder instance
const textEncoder = new TextEncoder()

// Pre-compute parameter string untuk menghindari string concatenation berulang
const ARGON2_PARAMS = {
  SECURE: { t: 4, m: 131072, p: 4 }, // 128MB RAM
  BALANCED: { t: 3, m: 65536, p: 2 }, // 64MB RAM
  FAST: { t: 2, m: 32768, p: 1 }, // 32MB RAM
} as const

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

export async function hashPassword(
  password: string,
  algorithm: PasswordAlgorithm
): Promise<string> {
  if (!passwordAlgorithmEnum.safeParse(algorithm).success) {
    throw new Error(`Unsupported password algorithm: ${algorithm}`)
  }

  if (algorithm === 'scrypt') {
    return await hashScrypt(password)
  }

  if (algorithm === 'argon2id') {
    return await hashArgon2id(password)
  }

  throw new Error(`Algorithm ${algorithm} is not implemented`)
}

export async function verifyPassword(
  password: string,
  hashedPassword: string,
  algorithm: PasswordAlgorithm
): Promise<boolean> {
  if (!passwordAlgorithmEnum.safeParse(algorithm).success) {
    throw new Error(`Unsupported password algorithm: ${algorithm}`)
  }

  try {
    if (algorithm === 'scrypt') {
      return await verifyScrypt(password, hashedPassword)
    }
    if (algorithm === 'argon2id') {
      return await verifyArgon2id(password, hashedPassword)
    }
  } catch (error) {
    logger.error('Password verification failed:', error)
    return false
  }

  throw new Error(`Algorithm ${algorithm} is not implemented`)
}

async function hashScrypt(password: string): Promise<string> {
  const salt = bytesToHex(randomBytes(16))

  // Get Scrypt parameters based on environment and server memory
  const mode = env.SCRYPT_MODE?.toUpperCase() || 'FAST'
  const params = SCRYPT_PARAMS[mode as keyof typeof SCRYPT_PARAMS] || SCRYPT_PARAMS.FAST

  const { N, r, p } = params
  const paramsStr = `${N}.${r}.${p}`

  const hash = await scryptAsync(new TextEncoder().encode(password), hexToBytes(salt), params)

  return `${paramsStr}.${salt}.${bytesToHex(hash)}`
}

async function verifyScrypt(password: string, hashedPassword: string): Promise<boolean> {
  const [N, r, p, salt, hash] = hashedPassword.split('.')

  const params = {
    N: Number.parseInt(N),
    r: Number.parseInt(r),
    p: Number.parseInt(p),
    dkLen: 32,
  }

  const newHash = await scryptAsync(new TextEncoder().encode(password), hexToBytes(salt), params)

  return bytesToHex(newHash) === hash
}

// Utility for constant-time string comparison
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false
  let result = 0
  for (let i = 0; i < a.length; i++) {
    result |= a.charCodeAt(i) ^ b.charCodeAt(i)
  }
  return result === 0
}

// TODO: usse workers for faster hashing
async function hashArgon2id(password: string): Promise<string> {
  const salt = randomBytes(16) // 16 bytes cukup untuk salt
  const mode = env.ARGON2_MODE?.toUpperCase() || 'BALANCED'
  const params = ARGON2_PARAMS[mode as keyof typeof ARGON2_PARAMS] || ARGON2_PARAMS.BALANCED

  // Encode password once using TextEncoder
  const encodedPassword = textEncoder.encode(password)

  // Use WebWorker if available, otherwise use synchronous version
  const hash = argon2id(encodedPassword, salt, params)
  const hashHex = bytesToHex(hash)

  // Format: t.m.p.salt.hash
  return `${params.t}.${params.m}.${params.p}.${bytesToHex(salt)}.${hashHex}`
}

// TODO: use workers for faster hash verification
async function verifyArgon2id(password: string, hashedPassword: string): Promise<boolean> {
  const [t, m, p, saltHex, hashHex] = hashedPassword.split('.')

  const params = {
    t: Number(t), // Gunakan Number() lebih cepat dari parseInt
    m: Number(m),
    p: Number(p),
    dkLen: 32,
  }

  const encodedPassword = textEncoder.encode(password)
  const salt = hexToBytes(saltHex)

  const newHash = argon2id(encodedPassword, salt, params)
  return timingSafeEqual(bytesToHex(newHash), hashHex)
}

/**
 * Hashes API token using Argon2id for secure storage
 */
export async function hashToken(token: string): Promise<string> {
  const encodedToken = textEncoder.encode(token)
  const salt = randomBytes(16)
  const params = ARGON2_PARAMS.FAST

  const hash = argon2id(encodedToken, salt, params)
  return bytesToHex(hash)
}

/**
 * Verifies API token against stored hash
 */
export async function verifyToken(token: string, hash: string): Promise<boolean> {
  const encodedToken = textEncoder.encode(token)
  const params = ARGON2_PARAMS.FAST
  const salt = hexToBytes(hash.slice(0, 32))

  const newHash = argon2id(encodedToken, salt, params)
  return timingSafeEqual(bytesToHex(newHash), hash)
}
