import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '#/components/base-ui/card'
import { Separator } from '#/components/base-ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/base-ui/tabs'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

import { BillingInfo } from './billing-info'
import { NotificationPreferences } from './notification-preferences'
import { PasswordForm } from './password-form'
import { ProfileForm } from './profile-form'
import { TwoFactorSetup } from './two-factor-setup'

export default function Component() {
  const { pageTitle } = useSEOMeta('Account Settings')

  return (
    <div className="mx-auto w-full max-w-3xl space-y-6 p-4 md:p-6 lg:p-8">
      <div className="space-y-0.5">
        <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
        <p className="text-muted-foreground text-sm">
          Manage your account settings and preferences
        </p>
      </div>

      <Separator />

      <Tabs defaultValue="general" className="space-y-4">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="general">General</TabsTrigger>
          <TabsTrigger value="security">Security</TabsTrigger>
          <TabsTrigger value="notifications">Notifications</TabsTrigger>
          <TabsTrigger value="billing">Billing</TabsTrigger>
        </TabsList>

        <TabsContent value="general">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Profile Information</CardTitle>
              <CardDescription>Update your profile information and preferences</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileForm />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="security" className="space-y-4">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Change Password</CardTitle>
              <CardDescription>Update your password to keep your account secure</CardDescription>
            </CardHeader>
            <CardContent>
              <PasswordForm />
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Two-Factor Authentication</CardTitle>
              <CardDescription>Add an extra layer of security to your account</CardDescription>
            </CardHeader>
            <CardContent>
              <TwoFactorSetup />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notifications">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Notification Preferences</CardTitle>
              <CardDescription>Choose how you want to be notified</CardDescription>
            </CardHeader>
            <CardContent>
              <NotificationPreferences />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="billing">
          <Card>
            <CardHeader className="space-y-1">
              <CardTitle>Payment Method</CardTitle>
              <CardDescription>Manage your payment information</CardDescription>
            </CardHeader>
            <CardContent>
              <BillingInfo />
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}

Component.displayName = 'AccountSettingsPage'
