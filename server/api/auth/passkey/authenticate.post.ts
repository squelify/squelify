import {
  VerifiedAuthenticationResponse,
  generateAuthenticationOptions,
  verifyAuthenticationResponse,
} from '@simplewebauthn/server'
import type {
  AuthenticationResponseJSON,
  PublicKeyCredentialRequestOptionsJSON,
} from '@simplewebauthn/typescript-types'
import { z } from 'zod'

export interface IAuthenticatePasskeyResponse {
  authentication: {
    verified: boolean
    authenticatedAt: string
    user: {
      id: string
      username: string
    }
  }
}

const AuthenticatePasskeySchema = z.object({
  response: z.object({
    id: z.string(),
    rawId: z.string(),
    response: z.object({
      authenticatorData: z.string(),
      clientDataJSON: z.string(),
      signature: z.string(),
      userHandle: z.string().optional(),
    }),
    type: z.literal('public-key'),
    clientExtensionResults: z.record(z.any()),
  }),
})

export default defineEventHandler(async (event) => {
  const db = event.context.db
  const now = Math.floor(Date.now() / 1000)

  try {
    const body = await requireValidatedBody(event, AuthenticatePasskeySchema)

    const passkey = await db
      .selectFrom('passkeys')
      .where('credentialId', '=', body.response.id)
      .select(['id', 'userId', 'credentialPublicKey', 'counter', 'rpId', 'origin'])
      .executeTakeFirst()

    if (!passkey) {
      await auditLog(event, {
        action: 'authenticate',
        entity: 'passkey',
        entityId: body.response.id,
        metadata: {
          success: false,
          reason: 'passkey_not_found',
        },
        retention: 'COMPLIANCE',
      })
      return createErrorResponse(event, 'Passkey not found', 404)
    }

    const user = await db
      .selectFrom('users')
      .where('id', '=', passkey.userId)
      .select(['id', 'username'])
      .executeTakeFirst()

    if (!user) {
      await auditLog(event, {
        action: 'authenticate',
        entity: 'passkey',
        entityId: passkey.id,
        metadata: {
          success: false,
          reason: 'user_not_found',
        },
        retention: 'COMPLIANCE',
      })
      return createErrorResponse(event, 'User not found', 404)
    }

    const verification = await verifyAuthenticationResponse({
      response: body.response as AuthenticationResponseJSON,
      expectedChallenge: '',
      expectedOrigin: passkey.origin,
      expectedRPID: passkey.rpId,
      authenticator: {
        credentialPublicKey: Buffer.from(passkey.credentialPublicKey, 'base64url'),
        credentialID: Buffer.from(body.response.id, 'base64url'),
        counter: passkey.counter,
      },
    } as any) // TODO: fix type

    if (!verification.verified) {
      await auditLog(event, {
        action: 'authenticate',
        entity: 'passkey',
        entityId: passkey.id,
        metadata: {
          success: false,
          reason: 'verification_failed',
          userId: user.id,
        },
        retention: 'COMPLIANCE',
      })
      return createErrorResponse(event, 'Passkey verification failed', 400)
    }

    await db
      .updateTable('passkeys')
      .set({
        counter: verification.authenticationInfo.newCounter,
        updatedAt: now,
      })
      .where('id', '=', passkey.id)
      .execute()

    await auditLog(event, {
      action: 'authenticate',
      entity: 'passkey',
      entityId: passkey.id,
      metadata: {
        success: true,
        userId: user.id,
      },
      retention: 'COMPLIANCE',
    })

    return createSuccessResponse<IAuthenticatePasskeyResponse>(
      event,
      'Passkey authentication successful',
      {
        authentication: {
          verified: true,
          authenticatedAt: toISOString(now),
          user: {
            id: user.id,
            username: user.username,
          },
        },
      }
    )
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
