import { z } from 'zod'
import { verifyTOTP } from '~/utils/totp'

const VerifyTOTPSchema = z
  .object({
    id: z.string(),
    code: z.string().length(6, 'Kode TOTP harus 6 karakter'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, VerifyTOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get TOTP record
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .where('type', '=', 'totp')
      .select(['id', 'secret', 'isVerified'])
      .executeTakeFirst()

    if (!twoFactor) {
      setResponseStatus(event, 404)
      return createErrorResponse(404, 'TOTP tidak ditemukan')
    }

    // Verify TOTP code
    const isValid = verifyTOTP(twoFactor.secret, body.code)
    if (!isValid) {
      setResponseStatus(event, 400)
      return createErrorResponse(400, 'Kode TOTP tidak valid')
    }

    // Update TOTP status if not verified
    if (!twoFactor.isVerified) {
      await db
        .updateTable('two_factors')
        .set({
          isVerified: 1,
          verifiedAt: now,
          lastUsedAt: now,
          updatedAt: now,
        })
        .where('id', '=', twoFactor.id)
        .execute()
    } else {
      // Just update last used timestamp
      await db
        .updateTable('two_factors')
        .set({
          lastUsedAt: now,
          updatedAt: now,
        })
        .where('id', '=', twoFactor.id)
        .execute()
    }

    return {
      status: 200,
      success: true,
      message: 'Verifikasi TOTP berhasil',
      data: {
        verifiedAt: new Date(now * 1000).toISOString(),
      },
    }
  } catch (error) {
    return throwErrorResponse(event, error)
  }
})
