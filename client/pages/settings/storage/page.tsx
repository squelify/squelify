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
        <Separator />
        <CardFooter className="flex justify-end pt-6 md:px-10">
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  )
}
