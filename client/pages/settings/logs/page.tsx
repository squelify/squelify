import { Button, Label, Separator, Switch } from '#/components/base-ui'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui'
import { SelectContent, SelectItem } from '#/components/base-ui'
import { TabsContent } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Page() {
  useSEOMeta('Logs Settings')

  return (
    <TabsContent value="logs" tabIndex={-1}>
      <Card>
        <CardHeader className="md:px-10">
          <CardTitle>Logging Configuration</CardTitle>
          <CardDescription>Configure system logging preferences</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6 pb-8 md:px-10">
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
        <Separator />
        <CardFooter className="flex justify-end pt-6 md:px-10">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  )
}
