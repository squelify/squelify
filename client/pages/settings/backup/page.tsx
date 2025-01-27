import { Button, Input, Label, NumberInput, Separator, Switch } from '#/components/base-ui'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui'
import { SelectContent, SelectItem } from '#/components/base-ui'
import { TabsContent } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Page() {
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
            <NumberInput
              placeholder="Retention period"
              className="w-full"
              defaultValue={30}
              min={0}
            />
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
