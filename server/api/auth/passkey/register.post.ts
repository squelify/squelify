// FIXME -- this is not working yet

import {
  VerifiedRegistrationResponse,
  generateRegistrationOptions,
  verifyRegistrationResponse,
} from '@simplewebauthn/server'
import type {
  AuthenticatorAttestationResponseJSON,
  AuthenticatorTransportFuture,
  Base64URLString,
  PublicKeyCredentialCreationOptionsJSON,
  PublicKeyCredentialType,
  RegistrationResponseJSON,
} from '@simplewebauthn/typescript-types'
import * as jose from 'jose'
import { typeid } from 'typeid-js'
import { z } from 'zod'
import { AppConfig } from '~/config'

const authenticatorAttestationResponseJSON = z.object({
  clientDataJSON: z.string() as z.ZodType<Base64URLString>,
  attestationObject: z.string() as z.ZodType<Base64URLString>,
  authenticatorData: z.string().optional() as z.ZodType<Base64URLString>,
  transports: z
    .array(z.enum(['ble', 'cable', 'hybrid', 'internal', 'nfc', 'smart-card', 'usb']))
    .optional() as z.ZodType<AuthenticatorTransportFuture[]>,
  publicKeyAlgorithm: z.number().optional(),
  publicKey: z.string().optional() as z.ZodType<Base64URLString>,
})

const registerResponseJSON = z.object({
  id: z.string() as z.ZodType<Base64URLString>,
  rawId: z.string() as z.ZodType<Base64URLString>,
  response: authenticatorAttestationResponseJSON, // as z.ZodType<AuthenticatorAttestationResponseJSON>
  authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(), //  as z.ZodType<AuthenticatorAttachment>
  clientExtensionResults: z.record(z.any()), // as z.ZodType<AuthenticationExtensionsClientOutputs>
  type: z.literal('public-key') as z.ZodType<PublicKeyCredentialType>,
})

const RegisterPasskeySchema = z
  .object({
    name: z.string().min(1, 'Nama passkey diperlukan'),
    response: registerResponseJSON, // satisfies z.ZodType<RegistrationResponseJSON>
  })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const appConfig = useAppConfig(event) as AppConfig
    const db = event.context.db
    const payload = await requireAuth(event)
    const body = await requireValidatedBody(event, RegisterPasskeySchema)
    const now = Math.floor(Date.now() / 1000)

    // Get user info
    const user = await db
      .selectFrom('users')
      .where('id', '=', payload.sub)
      .select(['id', 'username'])
      .executeTakeFirst()

    if (!user) {
      return createErrorResponse(404, 'User tidak ditemukan')
    }

    // Check if passkey name already exists
    const existingPasskey = await db
      .selectFrom('passkeys')
      .where('userId', '=', user.id)
      .where('name', '=', body.name)
      .select(['id'])
      .executeTakeFirst()

    if (existingPasskey) {
      return createErrorResponse(400, 'Nama passkey sudah digunakan')
    }

    // Get existing passkeys for exclusion
    const existingPasskeys = await db
      .selectFrom('passkeys')
      .where('userId', '=', user.id)
      .select(['credentialId', 'transports'])
      .execute()

    // Generate WebAuthn user ID as Uint8Array
    const webauthnUserId = new Uint8Array(16)
    crypto.getRandomValues(webauthnUserId)

    // Generate registration options
    const options: PublicKeyCredentialCreationOptionsJSON = await generateRegistrationOptions({
      rpName: appConfig.title,
      rpID: appConfig.domain,
      userID: webauthnUserId,
      userName: user.username,
      userDisplayName: user.username,
      timeout: 60000,
      attestationType: 'none',
      authenticatorSelection: {
        residentKey: 'preferred',
        userVerification: 'preferred',
        authenticatorAttachment: 'platform',
      },
      supportedAlgorithmIDs: [-7, -257],
      excludeCredentials: existingPasskeys.map((key) => ({
        id: key.credentialId,
        transports: key.transports ? JSON.parse(JSON.stringify(key.transports)) : undefined,
      })),
    })

    // Store webauthnUserId as base64url string
    const webauthnUserIdString = Buffer.from(webauthnUserId).toString('base64url')

    // Verify registration response
    const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
      response: body.response.response,
      expectedChallenge: options.challenge,
      expectedOrigin: appConfig.baseURL,
      expectedRPID: appConfig.domain,
    })

    if (!verification.verified || !verification.registrationInfo) {
      return createErrorResponse(400, 'Verifikasi passkey gagal')
    }

    const { credential } = verification.registrationInfo

    // Store the passkey
    await db
      .insertInto('passkeys')
      .values({
        id: typeid('pass').toString(),
        userId: user.id,
        webauthnUserId: webauthnUserIdString,
        name: body.name,
        credentialId: Buffer.from(credential.id).toString('base64url'),
        credentialPublicKey: Buffer.from(credential.publicKey).toString('base64url'),
        counter: credential.counter,
        transports: body.response.response.transports || null,
        rpId: appConfig.domain,
        origin: appConfig.baseURL,
        createdAt: now,
      })
      .execute()

    return {
      status: 200,
      success: true,
      message: 'Passkey berhasil didaftarkan',
      data: {
        name: body.name,
        registeredAt: new Date(now * 1000).toISOString(),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
