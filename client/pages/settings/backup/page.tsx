import { Button } from '#/components/base-ui/button'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/base-ui/card'
import { CardDescription, CardTitle } from '#/components/base-ui/card'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui/select'
import { SelectContent, SelectItem } from '#/components/base-ui/select'
import { Separator } from '#/components/base-ui/separator'
import { Switch } from '#/components/base-ui/switch'
import { TabsContent } from '#/components/base-ui/tabs'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Component() {
  useSEOMeta('Backup Settings')

  return (
    <TabsContent value="backup" tabIndex={-1}>
      <Card>
        <CardHeader className="md:px-10">
          <CardTitle>Backup Settings</CardTitle>
          <CardDescription>Configure automated backups</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6 pb-8 md:px-10">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Automated Backups</Label>
              <p className="text-muted-foreground text-sm">Enable scheduled backups</p>
            </div>
            <Switch />
          </div>
          <div className="grid gap-2">
            <Label>Backup Frequency</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select frequency" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="daily">Daily</SelectItem>
                <SelectItem value="weekly">Weekly</SelectItem>
                <SelectItem value="monthly">Monthly</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Retention Period (days)</Label>
            <Input type="number" placeholder="30" />
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

Component.displayName = 'SettingsBackup'
