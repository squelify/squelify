import { Button, Input, Label, TabsContent } from '#/components/base-ui'
import { Card, CardContent, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import PageWrapper from '#/layouts/page-wrapper'

import { TwoFactorSetup } from './two-factor-setup'

export default function Page() {
  return (
    <PageWrapper title="Security">
      <TabsContent value="security" className="space-y-4">
        <Card>
          <CardHeader className="space-y-1">
            <CardTitle>Change Password</CardTitle>
            <CardDescription>Update your password to keep your account secure</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4">
              <div className="grid gap-2">
                <Label htmlFor="current">Current Password</Label>
                <Input id="current" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="new">New Password</Label>
                <Input id="new" type="password" />
              </div>
              <div className="grid gap-2">
                <Label htmlFor="confirm">Confirm Password</Label>
                <Input id="confirm" type="password" />
              </div>
              <div className="flex justify-end">
                <Button>Update Password</Button>
              </div>
            </div>
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
    </PageWrapper>
  )
}
