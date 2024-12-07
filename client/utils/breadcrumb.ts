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

  // Handle special routes
  if (cleanPath.startsWith('/settings')) {
    return handleSettingsRoute(pathSegments)
  }

  if (cleanPath.startsWith('/content')) {
    return handleContentRoute(cleanPath, menuGroups)
  }

  if (cleanPath.startsWith('/authorization')) {
    return handleAuthorizationRoute(pathSegments)
  }

  // Default menu item lookup
  return findMenuItemBreadcrumb(cleanPath, menuGroups)
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
function handleContentRoute(
  path: string,
  menuGroups: MenuGroup[]
): { title: string; url: string }[] {
  const contentGroup = menuGroups.find((group) =>
    group.items.some((item) => item.url.startsWith('/content'))
  )

  if (!contentGroup) return []

  const result = [{ title: 'Content', url: '/content' }]
  const matchingItem = contentGroup.items.find((item) => path.startsWith(item.url))

  if (matchingItem) {
    result.push({ title: matchingItem.title, url: matchingItem.url })
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
