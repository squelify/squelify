import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation } from 'react-router'
import { Separator } from '#/components/base-ui/separator'
import { Tabs, TabsList, TabsTrigger } from '#/components/base-ui/tabs'
import { Link } from '#/components/link'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'

interface SettingsTab {
  label: string
  value: string
  href: string
}

const SETTINGS_TABS: SettingsTab[] = [
  { label: 'General', value: 'general', href: '/settings/general' },
  { label: 'Authentication', value: 'auth', href: '/settings/auth' },
  { label: 'Email', value: 'email', href: '/settings/email' },
  { label: 'Storage', value: 'storage', href: '/settings/storage' },
  { label: 'Backup', value: 'backup', href: '/settings/backup' },
  { label: 'Logs', value: 'logs', href: '/settings/logs' },
]

export default function SettingsLayout() {
  const location = useLocation()

  // Extract the active section from the path
  const activeSection = location.pathname.split('/settings/')[1] || 'general'

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <div className="container mx-auto w-full max-w-4xl space-y-6 p-4 md:p-6 lg:p-8">
        <header className="space-y-0.5">
          <h1 className="font-semibold text-2xl tracking-tight">System Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure system-wide settings and preferences
          </p>
        </header>

        <Separator className="my-6" />

        <Tabs value={activeSection} defaultValue={activeSection} className="space-y-6">
          <TabsList className="w-full justify-start overflow-x-auto">
            {SETTINGS_TABS.map((tab) => (
              <TabsTrigger key={tab.value} value={tab.value} asChild>
                <Link href={tab.href}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-[400px]">
            <Outlet />
          </div>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
