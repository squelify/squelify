export default defineEventHandler(async (event) => {
  const appConfig = event.context.appConfig
  const db = event.context.db

  // Check if already installed
  const isInstalled = await db
    .selectFrom('sq_users as users')
    .innerJoin('sq_user_roles as user_roles', 'user_roles.userId', 'users.id')
    .innerJoin('sq_roles as roles', 'roles.id', 'user_roles.roleId')
    .where('roles.name', '=', 'admin')
    .where('users.isActive', '=', 1)
    .select('users.id')
    .executeTakeFirst()

  if (isInstalled) {
    // TODO: handle double slash in baseURL
    const redirectUrl = `${appConfig.baseURL}${appConfig.adminPath}/login`
    return sendRedirect(event, redirectUrl, 302)
  }

  const query = getQuery(event)

  return createTemplateHandler({
    title: 'Squelify Installer',
    extraContext: {
      error: query.error || null,
    },
  })(event)
})
