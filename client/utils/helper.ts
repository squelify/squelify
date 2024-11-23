import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import type { MenuGroup } from '#/context/hooks/use-menu'

/**
 * Combines multiple CSS class values using the `clsx` and `tailwind-merge` libraries.
 *
 * @param args - An array of CSS class values to be combined.
 * @returns The combined CSS class value.
 */
export function clx(...args: ClassValue[]) {
  return twMerge(clsx(...args))
}

/**
 * Get breadcrumb items with parent group label
 */
export function getBreadcrumbItems(
  pathname: string,
  menuGroups: MenuGroup[]
): { title: string; url: string }[] {
  // Skip if pathname is dashboard
  if (pathname === '/dashboard') {
    return []
  }

  // Remove URL parameters and trailing slashes
  const cleanPath = pathname.split('?')[0].replace(/\/+$/, '')
  const pathSegments = cleanPath.split('/')

  // Special handling for settings pages
  if (cleanPath.startsWith('/settings')) {
    const settingsGroup = menuGroups.find((group) =>
      group.items.some((item) => item.url === '/settings')
    )
    if (settingsGroup) {
      const settingsItem = settingsGroup.items.find((item) => item.url === '/settings')
      const result = [{ title: settingsItem?.title || 'Settings', url: '/settings' }]

      // Add sub-section if exists
      if (pathSegments.length > 2) {
        const section = pathSegments[2]
        result.push({
          title: section.charAt(0).toUpperCase() + section.slice(1),
          url: `/settings/${section}`,
        })
      }

      return result
    }
  }

  // Find matching menu item and its group
  for (const group of menuGroups) {
    const matchingItem = group.items.find((item) => {
      // Check if current path starts with menu item URL
      return cleanPath.startsWith(item.url)
    })

    if (matchingItem) {
      const result = []

      // Add group label if not hidden
      if (!group.hideLabel) {
        result.push({ title: group.label, url: pathname })
      }

      // Add menu item
      result.push({ title: matchingItem.title, url: matchingItem.url })

      return result
    }
  }

  return []
}

/**
 * Custom encoder to handle special cases and remove quotes for primitive values
 * while keeping JSON format for objects
 * @param value - Value to be encoded
 */
export function storeEncode(value: any): string {
  if (value === null) return 'null'
  if (typeof value === 'string') return value
  if (typeof value === 'number') return value.toString()
  if (typeof value === 'object') return JSON.stringify(value)
  return String(value)
}

/**
 * Custom decoder to parse values correctly
 * @param value - Value to be decoded
 */
export function storeDecode(value: string): any {
  if (value === 'null') return null
  if (value === '') return null
  if (value === 'undefined') return undefined

  // Try parsing as number
  const num = Number(value)
  if (!Number.isNaN(num)) return num

  // Try parsing as JSON for objects
  try {
    return JSON.parse(value)
  } catch {
    // If not JSON, return as is
    return value
  }
}
