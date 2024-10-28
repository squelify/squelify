import { z } from 'zod'

const DisableTOTPSchema = z
  .object({
    id: z.string({ required_error: 'ID authenticator diperlukan' }),
    code: z.string().length(6, 'Kode TOTP harus 6 karakter'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  try {
    const db = event.context.db
    const payload = await requireAuth(event)
    const body = await requireValidatedBody(event, DisableTOTPSchema)
    const now = Math.floor(Date.now() / 1000)

    // Get TOTP record with complete status check
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .where('type', '=', 'totp')
      .select(['id', 'name', 'secret', 'isPrimary', 'isVerified', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(404, 'Authenticator tidak ditemukan')
    }

    if (!twoFactor.isVerified) {
      return createErrorResponse(400, 'Authenticator belum diverifikasi')
    }

    // Verify TOTP code first
    const isValid = verifyTOTP(twoFactor.secret, body.code)
    if (!isValid) {
      return createErrorResponse(400, 'Kode TOTP tidak valid')
    }

    // Check if this is the last verified 2FA
    if (twoFactor.isPrimary) {
      const otherVerified2FA = await db
        .selectFrom('two_factors')
        .where('userId', '=', payload.sub)
        .where('id', '!=', twoFactor.id)
        .where('isVerified', '=', 1)
        .select(['id', 'name'])
        .executeTakeFirst()

      if (!otherVerified2FA) {
        return createErrorResponse(
          400,
          'Tidak dapat menonaktifkan authenticator utama. Aktifkan authenticator lain terlebih dahulu.'
        )
      }

      // Set other 2FA as primary
      await db
        .updateTable('two_factors')
        .set({
          isPrimary: 1,
          updatedAt: now,
        })
        .where('id', '=', otherVerified2FA.id)
        .execute()
    }

    // Delete the TOTP record
    await db.deleteFrom('two_factors').where('id', '=', twoFactor.id).execute()

    return {
      status: 200,
      success: true,
      message: `Authenticator "${twoFactor.name}" berhasil dinonaktifkan`,
      data: {
        id: twoFactor.id,
        name: twoFactor.name,
        disabledAt: new Date(now * 1000).toISOString(),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
