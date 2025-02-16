import { Button, Input, Label, Separator, Switch } from '#/components/base-ui'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui'
import { SelectContent, SelectItem } from '#/components/base-ui'
import { TabsContent } from '#/components/base-ui'
import PageWrapper from '#/layouts/page-wrapper'

export default function Page() {
  return (
    <PageWrapper title="System Settings">
      <TabsContent value="general" tabIndex={-1} className="grid gap-6">
        <Card>
          <CardHeader className="md:px-10">
            <CardTitle>Application Settings</CardTitle>
            <CardDescription>Configure your application details</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-6 pt-6 pb-8 md:px-10">
            <div className="grid gap-2">
              <Label>Application Name</Label>
              <Input placeholder="My Application" />
            </div>
            <div className="grid gap-2">
              <Label>Application URL</Label>
              <Input placeholder="https://example.com" />
            </div>
            <div className="grid gap-2">
              <Label>Default Timezone</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select timezone" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="utc+7">Western Indonesia Time (UTC+7)</SelectItem>
                  <SelectItem value="utc+8">Singapore Time (UTC+8)</SelectItem>
                  <SelectItem value="utc+0">UTC</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </CardContent>
          <Separator />
          <CardFooter className="flex justify-end pt-6 md:px-10">
            <Button>Save Changes</Button>
          </CardFooter>
        </Card>

        <Card>
          <CardHeader className="md:px-10">
            <CardTitle>Security Settings</CardTitle>
            <CardDescription>Configure security preferences</CardDescription>
          </CardHeader>
          <Separator />
          <CardContent className="grid gap-6 pt-6 pb-8 md:px-10">
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>Rate Limiting</Label>
                <p className="text-muted-foreground text-sm">
                  Limit request rates to prevent abuse
                </p>
              </div>
              <Switch />
            </div>
            <div className="flex items-center justify-between">
              <div className="space-y-0.5">
                <Label>CORS Protection</Label>
                <p className="text-muted-foreground text-sm">
                  Control cross-origin resource sharing
                </p>
              </div>
              <Switch />
            </div>
          </CardContent>
        </Card>
      </TabsContent>
    </PageWrapper>
  )
}
