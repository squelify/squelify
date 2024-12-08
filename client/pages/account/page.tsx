import { useQueryState } from 'nuqs'
import { Separator } from '#/components/base-ui/separator'
import { Tabs, TabsList, TabsTrigger } from '#/components/base-ui/tabs'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

import TabGeneral from './tab-general'
import TabLoginHistory from './tab-login-history'
import TabNotifications from './tab-notifications'
import TabSecurity from './tab-security'

interface AccountSettingsTab {
  label: string
  value: string
}

const ACCOUNT_TABS: AccountSettingsTab[] = [
  { label: 'General', value: 'general' },
  { label: 'Security', value: 'security' },
  { label: 'Notifications', value: 'notifications' },
  { label: 'Login History', value: 'login-history' },
]

export default function Page() {
  const { pageTitle } = useSEOMeta('Account Settings')

  // Extract the active section from the query parameter
  const [activeTab, setActiveTab] = useQueryState('activeTab')
  const activeSection = activeTab || 'general'

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
            <TabsTrigger key={tab.value} value={tab.value} onClick={() => setActiveTab(tab.value)}>
              {tab.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabGeneral />
        <TabSecurity />
        <TabNotifications />
        <TabLoginHistory />
      </Tabs>
    </div>
  )
}
