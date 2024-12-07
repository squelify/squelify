import * as Lucide from 'lucide-react'
import type { LucideIcon } from 'lucide-react'

export interface MenuItem {
  title: string
  url: string
  icon: LucideIcon
}

export interface MenuGroup {
  label: string
  hideLabel?: boolean
  items: MenuItem[]
}

export function useMenu() {
  const menuGroups: MenuGroup[] = [
    {
      label: 'Workspace',
      hideLabel: true,
      items: [
        { title: 'Dashboard', url: '/dashboard', icon: Lucide.LayoutDashboard },
        { title: 'SQL Console', url: '/console', icon: Lucide.SquareChartGantt },
        { title: 'User Management', url: '/users', icon: Lucide.Users },
        { title: 'Authorization', url: '/authorization', icon: Lucide.ShieldCheck },
      ],
    },
    {
      label: 'Content',
      items: [
        { title: 'Collections', url: '/content/collections', icon: Lucide.Database },
        { title: 'Media Library', url: '/content/media', icon: Lucide.Image },
      ],
    },
    {
      label: 'System',
      items: [
        { title: 'Audit Logs', url: '/audit-logs', icon: Lucide.ScrollText },
        { title: 'Webhooks', url: '/webhooks', icon: Lucide.Webhook },
        { title: 'API Keys', url: '/api-keys', icon: Lucide.Key },
        { title: 'Settings', url: '/settings', icon: Lucide.Settings2 },
      ],
    },
  ]

  return { menuGroups }
}
