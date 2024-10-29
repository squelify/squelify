export default defineEventHandler(async (event) => {
  const { payload, session } = event.context.auth
  try {
    return {
      status: 200,
      success: true,
      data: {
        sub: payload.sub,
        sid: payload.sid,
        email: payload.email,
        name: payload.name,
        given_name: payload.given_name,
        family_name: payload.family_name,
        locale: payload.locale,
        amr: payload.amr,
        roles: payload.roles,
        perms: payload.perms,
        org_id: payload.org_id,
        session,
      },
    }
  } catch (error) {
    return throwErrorResponse(error)
  }
})
