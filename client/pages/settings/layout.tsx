import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation } from 'react-router'
import { Separator } from '#/components/base-ui'
import { Tabs, TabsList, TabsTrigger } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import BoundaryError from '#/components/errors/boundary'
import { clx } from '#/utils/helper'

interface SettingsTab {
  label: string
  value: string
  href: string
}

const SETTINGS_TABS: SettingsTab[] = [
  { label: 'General', value: 'general', href: '/settings/general' },
  { label: 'Authentication', value: 'authentication', href: '/settings/authentication' },
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
    <ErrorBoundary FallbackComponent={BoundaryError}>
      <div className="container mx-auto w-full max-w-5xl space-y-6 p-4 md:p-6 lg:p-8">
        <header className="space-y-0.5">
          <h1 className="font-semibold text-2xl tracking-tight">System Settings</h1>
          <p className="text-muted-foreground text-sm">
            Configure system-wide settings and preferences
          </p>
        </header>

        <Separator className="my-6" />

        <Tabs value={activeSection} defaultValue={activeSection} className="w-full">
          <TabsList
            className={clx('mb-0 w-full justify-start rounded-none border-b bg-transparent p-0')}
          >
            {SETTINGS_TABS.map((tab) => (
              <TabsTrigger
                key={tab.value}
                value={tab.value}
                className="-mb-[2px] h-full rounded-none rounded-t border border-transparent border-b-border bg-transparent data-[state=active]:border-border data-[state=active]:border-b-background data-[state=active]:shadow-none"
                asChild
              >
                <Link href={tab.href}>{tab.label}</Link>
              </TabsTrigger>
            ))}
          </TabsList>

          <div className="min-h-[400px] w-full py-4">
            <Outlet />
          </div>
        </Tabs>
      </div>
    </ErrorBoundary>
  )
}
