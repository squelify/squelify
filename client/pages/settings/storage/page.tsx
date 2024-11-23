import { Card, CardContent, CardHeader } from '#/components/base-ui/card'
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
  useSEOMeta('Storage Settings')

  return (
    <TabsContent value="storage" tabIndex={-1}>
      <Card>
        <CardHeader>
          <CardTitle>Storage Settings</CardTitle>
          <CardDescription>Configure file storage preferences</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-2">
            <Label>Storage Provider</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Storage</SelectItem>
                <SelectItem value="s3">Amazon S3</SelectItem>
                <SelectItem value="gcs">Google Cloud Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Upload Limit (MB)</Label>
            <Input type="number" placeholder="10" />
          </div>
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Image Optimization</Label>
              <p className="text-muted-foreground text-sm">
                Automatically optimize uploaded images
              </p>
            </div>
            <Switch />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

Component.displayName = 'SettingsStorage'
