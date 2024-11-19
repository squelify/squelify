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

export interface IRegisterPasskeyResponse {
  passkey: {
    name: string
    registeredAt: string
  }
}

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
  response: authenticatorAttestationResponseJSON,
  authenticatorAttachment: z.enum(['platform', 'cross-platform']).optional(),
  clientExtensionResults: z.record(z.any()),
  type: z.literal('public-key') as z.ZodType<PublicKeyCredentialType>,
})

const RegisterPasskeySchema = z
  .object({
    name: z.string().min(1, 'Passkey name is required'),
    response: registerResponseJSON,
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const appConfig = event.context.appConfig
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, RegisterPasskeySchema)
    const now = Math.floor(Date.now() / 1000)

    const user = await db
      .selectFrom('sq_users')
      .where('id', '=', payload.sub)
      .select(['id', 'username'])
      .executeTakeFirst()

    if (!user) {
      await auditLog(event, {
        action: 'create',
        entity: 'passkey',
        entityId: 'anonymous',
        metadata: {
          success: false,
          reason: 'user_not_found',
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'User not found', 404)
    }

    const existingPasskey = await db
      .selectFrom('sq_passkeys')
      .where('userId', '=', user.id)
      .where('name', '=', body.name)
      .select(['id'])
      .executeTakeFirst()

    if (existingPasskey) {
      await auditLog(event, {
        action: 'create',
        entity: 'passkey',
        entityId: user.id,
        metadata: {
          success: false,
          reason: 'name_exists',
          name: body.name,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Passkey name already in use', 400)
    }

    const existingPasskeys = await db
      .selectFrom('sq_passkeys')
      .where('userId', '=', user.id)
      .select(['credentialId', 'transports'])
      .execute()

    const webauthnUserId = new Uint8Array(16)
    crypto.getRandomValues(webauthnUserId)

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

    const webauthnUserIdString = Buffer.from(webauthnUserId).toString('base64url')

    const verification: VerifiedRegistrationResponse = await verifyRegistrationResponse({
      response: body.response.response as any,
      expectedChallenge: options.challenge,
      expectedOrigin: appConfig.baseURL,
      expectedRPID: appConfig.domain,
    })

    if (!verification.verified || !verification.registrationInfo) {
      await auditLog(event, {
        action: 'create',
        entity: 'passkey',
        entityId: user.id,
        metadata: {
          success: false,
          reason: 'verification_failed',
          name: body.name,
        },
        retention: 'CRITICAL',
      })
      return createErrorResponse(event, 'Passkey verification failed', 400)
    }

    const { credential } = verification.registrationInfo

    const passkeyId = typeid('pass').toString()
    await db
      .insertInto('sq_passkeys')
      .values({
        id: passkeyId,
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

    await auditLog(event, {
      action: 'create',
      entity: 'passkey',
      entityId: passkeyId,
      metadata: {
        success: true,
        userId: user.id,
        name: body.name,
      },
      retention: 'CRITICAL',
    })

    return createSuccessResponse<IRegisterPasskeyResponse>(
      event,
      'Passkey registered successfully',
      {
        passkey: {
          name: body.name,
          registeredAt: toISOString(now),
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
