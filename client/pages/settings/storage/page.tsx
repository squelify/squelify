import { Button, Input, Label, NumberInput, Separator, Switch } from '#/components/base-ui'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui'
import { SelectContent, SelectItem } from '#/components/base-ui'
import { TabsContent } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Page() {
  useSEOMeta('Storage Settings')

  return (
    <TabsContent value="storage" tabIndex={-1}>
      <Card>
        <CardHeader className="md:px-10">
          <CardTitle>Storage Settings</CardTitle>
          <CardDescription>Configure file storage preferences</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6 pb-8 md:px-10">
          <div className="grid gap-2">
            <Label>Storage Provider</Label>
            <Select>
              <SelectTrigger>
                <SelectValue placeholder="Select provider" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="local">Local Disk</SelectItem>
                <SelectItem value="s3">S3 Storage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="grid gap-2">
            <Label>Upload Limit (MB)</Label>
            <NumberInput placeholder="Limit in MB" className="w-full" min={1} />
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
        <Separator />
        <CardFooter className="flex justify-end pt-6 md:px-10">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  )
}
