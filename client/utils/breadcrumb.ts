import type { MenuGroup } from '#/context/hooks/use-menu'

/**
 * Get breadcrumb items with parent group label
 * Optimized version with better route handling
 */
export function getBreadcrumbItems(
  pathname: string,
  menuGroups: MenuGroup[]
): { title: string; url: string }[] {
  // Early returns for common cases
  if (!pathname || pathname === '/') return []
  if (pathname === '/dashboard') return []

  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '')
  const pathSegments = cleanPath.split('/')

  // Check standalone routes first
  const standaloneResult = handleStandaloneRoute(cleanPath)
  if (standaloneResult.length) return standaloneResult

  // Handle special routes
  if (cleanPath.startsWith('/settings')) {
    return handleSettingsRoute(pathSegments)
  }

  if (cleanPath.startsWith('/content')) {
    return handleContentRoute(cleanPath)
  }

  if (cleanPath.startsWith('/authorization')) {
    return handleAuthorizationRoute(pathSegments)
  }

  if (cleanPath.startsWith('/console')) {
    return handleConsoleRoute(pathSegments)
  }

  // Default menu item lookup
  return findMenuItemBreadcrumb(cleanPath, menuGroups)
}

/**
 * Handle standalone route breadcrumbs
 */
function handleStandaloneRoute(path: string): { title: string; url: string }[] {
  const standalonePages: Record<string, string> = {
    account: 'My Account',
    'audit-log': 'Audit Log',
    webhooks: 'Webhooks',
    'api-keys': 'API Keys',
    users: 'Users',
  }

  const segment = path.split('/')[1]
  if (standalonePages[segment]) {
    return [
      {
        title: standalonePages[segment],
        url: `/${segment}`,
      },
    ]
  }

  return []
}

/**
 * Handle settings route breadcrumbs
 */
function handleSettingsRoute(segments: string[]): { title: string; url: string }[] {
  const result = [{ title: 'Settings', url: '/settings' }]

  if (segments.length > 2) {
    const section = segments[2]
    result.push({
      title: getSettingsTitle(section),
      url: `/settings/${section}`,
    })
  }

  return result
}

/**
 * Handle content route breadcrumbs
 */
function handleContentRoute(path: string): { title: string; url: string }[] {
  const result = [{ title: 'Content', url: '/content' }]

  const contentPages: Record<string, string> = {
    collections: 'Collections',
    media: 'Media Library',
  }

  const section = path.split('/')[2]
  if (contentPages[section]) {
    result.push({
      title: contentPages[section],
      url: `/content/${section}`,
    })
  }

  return result
}

/**
 * Handle authorization route breadcrumbs
 */
function handleAuthorizationRoute(segments: string[]): { title: string; url: string }[] {
  const result = [{ title: 'Authorization', url: '/authorization' }]

  const section = segments[segments.length - 1]
  const authPages: Record<string, string> = {
    roles: 'Roles',
    permissions: 'Permissions',
  }

  if (authPages[section]) {
    result.push({
      title: authPages[section],
      url: `/authorization/${section}`,
    })
  }

  return result
}

/**
 * Handle console route breadcrumbs
 */
function handleConsoleRoute(segments: string[]): { title: string; url: string }[] {
  const result = [{ title: 'SQL Console', url: '/console' }]

  const section = segments[segments.length - 1]
  const consolePages: Record<string, string> = {
    table: 'Table Editor',
    query: 'Query Editor',
  }

  if (consolePages[section]) {
    result.push({
      title: consolePages[section],
      url: `/console/${section}`,
    })
  }

  return result
}

/**
 * Find menu item breadcrumb from menuGroups
 */
function findMenuItemBreadcrumb(
  path: string,
  menuGroups: MenuGroup[]
): { title: string; url: string }[] {
  for (const group of menuGroups) {
    const item = group.items.find((item) => path.startsWith(item.url))
    if (item) {
      const result = []
      if (!group.hideLabel) {
        result.push({ title: group.label, url: '#' })
      }
      result.push({ title: item.title, url: item.url })
      return result
    }
  }
  return []
}

/**
 * Get settings page title
 */
function getSettingsTitle(section: string): string {
  const titles: Record<string, string> = {
    general: 'General Settings',
    auth: 'Authentication',
    email: 'Email Settings',
    storage: 'Storage Settings',
    backup: 'Backup & Restore',
    logs: 'System Logs',
  }
  return titles[section] || section.charAt(0).toUpperCase() + section.slice(1)
}
