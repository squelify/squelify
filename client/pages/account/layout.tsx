import { Suspense } from 'react'
import { Link, Outlet, useLocation } from 'react-router'
import { Separator, Tabs, TabsList, TabsTrigger } from '#/components/base-ui'
import PageLoader from '#/components/loaders/page-loader'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

interface AccountSettingsTab {
  label: string
  value: string
}

const ACCOUNT_TABS: AccountSettingsTab[] = [
  { label: 'Profile', value: 'profile' },
  { label: 'Security', value: 'security' },
  { label: 'Notifications', value: 'notification' },
  { label: 'Login History', value: 'login-history' },
]

export default function AccountLayout() {
  const { pageTitle } = useSEOMeta('Account Settings')
  const location = useLocation()

  // Extract the active section from the path
  const activeSection = location.pathname.split('/account/')[1] || 'profile'

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6 lg:p-8">
      <div className="space-y-0.5">
        <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      <Tabs value={activeSection} defaultValue={activeSection} className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          {ACCOUNT_TABS.map((tab) => (
            <TabsTrigger key={tab.value} value={tab.value} asChild>
              <Link to={tab.value}>{tab.label}</Link>
            </TabsTrigger>
          ))}
        </TabsList>

        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </Tabs>
    </div>
  )
}
