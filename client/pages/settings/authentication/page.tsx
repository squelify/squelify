import { Card, CardContent, CardHeader } from '#/components/base-ui/card'
import { CardDescription, CardTitle } from '#/components/base-ui/card'
import { Separator } from '#/components/base-ui/separator'
import { TabsContent } from '#/components/base-ui/tabs'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import { AuthProviderForm } from './auth-provider-form'

export default function Component() {
  useSEOMeta('Authentication Settings')

  return (
    <TabsContent value="auth" tabIndex={-1}>
      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Authentication Providers</CardTitle>
            <CardDescription>Configure authentication methods and providers</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-6 pt-6">
            <AuthProviderForm />
          </CardContent>
        </Card>
      </div>
    </TabsContent>
  )
}

Component.displayName = 'SettingsAuth'
