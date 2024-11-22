export default defineEventHandler(async (event) => {
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
    return sendRedirect(event, '/ui/login', 302)
  }

  const query = getQuery(event)

  return createTemplateHandler({
    title: 'Squelify Installer',
    extraContext: {
      error: query.error || null,
    },
  })(event)
})
