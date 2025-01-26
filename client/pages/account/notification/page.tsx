import { Card, CardContent, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Separator, Switch, TabsContent } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Page() {
  useSEOMeta('Notification')

  return (
    <TabsContent value="notification">
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
