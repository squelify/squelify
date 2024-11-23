import { Card, CardContent, CardHeader } from '#/components/base-ui/card'
import { CardDescription, CardTitle } from '#/components/base-ui/card'
import { Label } from '#/components/base-ui/label'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui/select'
import { SelectContent, SelectItem } from '#/components/base-ui/select'
import { Separator } from '#/components/base-ui/separator'
import { Switch } from '#/components/base-ui/switch'
import { TabsContent } from '#/components/base-ui/tabs'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Component() {
  useSEOMeta('Logs Settings')

  return (
    <TabsContent value="logs" tabIndex={-1}>
      <Card>
        <CardHeader>
          <CardTitle>Logging Configuration</CardTitle>
          <CardDescription>Configure system logging preferences</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-2">
            <Label>Log Level</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select level" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="debug">Debug</SelectItem>
                <SelectItem value="info">Info</SelectItem>
                <SelectItem value="warn">Warning</SelectItem>
                <SelectItem value="error">Error</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>API Request Logging</Label>
              <p className="text-muted-foreground text-sm">Log all API requests</p>
            </div>
            <Switch />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Error Tracking</Label>
              <p className="text-muted-foreground text-sm">Track and report application errors</p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

Component.displayName = 'SettingsLogs'
