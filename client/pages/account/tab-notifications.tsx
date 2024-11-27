import { Card, CardContent, CardHeader } from '#/components/base-ui/card'
import { CardDescription, CardTitle } from '#/components/base-ui/card'
import { Separator } from '#/components/base-ui/separator'
import { Switch } from '#/components/base-ui/switch'
import { TabsContent } from '#/components/base-ui/tabs'

export default function TabNotifications() {
  return (
    <TabsContent value="notifications">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Notification Preferences</CardTitle>
          <CardDescription>Choose how you want to be notified</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Email Notifications</p>
                <p className="text-muted-foreground text-sm">Get notified via email</p>
              </div>
              <Switch />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <p className="font-medium">Browser Push</p>
                <p className="text-muted-foreground text-sm">Get browser notifications</p>
              </div>
              <Switch />
            </div>
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
