import { Button } from '#/components/base-ui/button'
import { Card, CardContent, CardHeader } from '#/components/base-ui/card'
import { CardDescription, CardTitle } from '#/components/base-ui/card'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'
import { TabsContent } from '#/components/base-ui/tabs'

import { TwoFactorSetup } from './two-factor-setup'

export default function TabSecurity() {
  return (
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
  )
}
