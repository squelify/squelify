import { z } from 'zod'

const RecoverySchema = z
  .object({
    id: z.string({ required_error: 'ID authenticator diperlukan' }),
    code: z.string().length(8, 'Kode backup harus 8 karakter'),
  })
  .strict()

export default defineEventHandler(async (event) => {
  const payload = event.context.auth.payload
  const db = event.context.db

  try {
    const body = await requireValidatedBody(event, RecoverySchema)
    const now = Math.floor(Date.now() / 1000)

    // Get 2FA record with complete status check
    const twoFactor = await db
      .selectFrom('two_factors')
      .where('id', '=', body.id)
      .where('userId', '=', payload.sub)
      .select(['id', 'name', 'type', 'isVerified', 'backupCodes', 'lastUsedAt'])
      .executeTakeFirst()

    if (!twoFactor) {
      return createErrorResponse(404, 'Authenticator tidak ditemukan')
    }

    if (!twoFactor.isVerified) {
      return createErrorResponse(400, 'Authenticator belum diverifikasi')
    }

    // Parse and verify backup codes
    let backupCodes: string[]

    try {
      backupCodes = JSON.parse(JSON.stringify(twoFactor.backupCodes))

      if (!Array.isArray(backupCodes)) {
        throw new Error('Invalid backup codes format')
      }
    } catch {
      return createErrorResponse(500, 'Format backup codes tidak valid')
    }

    if (backupCodes.length === 0) {
      return createErrorResponse(400, 'Tidak ada kode backup yang tersedia')
    }

    const codeIndex = backupCodes.indexOf(body.code)
    if (codeIndex === -1) {
      return createErrorResponse(400, 'Kode backup tidak valid atau sudah digunakan')
    }

    // Remove used backup code
    backupCodes.splice(codeIndex, 1)

    // Update backup codes and usage info
    await db
      .updateTable('two_factors')
      .set({
        backupCodes: JSON.stringify(backupCodes),
        lastUsedAt: now,
        updatedAt: now,
      })
      .where('id', '=', twoFactor.id)
      .execute()

    return {
      status: 200,
      success: true,
      message: `Recovery berhasil untuk authenticator '${twoFactor.name}'`,
      data: {
        id: twoFactor.id,
        name: twoFactor.name,
        type: twoFactor.type,
        remainingCodes: backupCodes.length,
        lastUsedAt: new Date(now * 1000).toISOString(),
        recoveredAt: new Date(now * 1000).toISOString(),
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
