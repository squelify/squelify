import { Card, CardContent, CardHeader } from '#/components/base-ui/card'
import { CardDescription, CardTitle } from '#/components/base-ui/card'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui/select'
import { SelectContent, SelectItem } from '#/components/base-ui/select'
import { Separator } from '#/components/base-ui/separator'
import { TabsContent } from '#/components/base-ui/tabs'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Component() {
  useSEOMeta('Email Settings')

  return (
    <TabsContent value="email" tabIndex={-1}>
      <Card>
        <CardHeader>
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Configure email delivery settings</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6">
          <div className="grid gap-2">
            <Label>SMTP Host</Label>
            <Input placeholder="smtp.example.com" />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Label>SMTP Port</Label>
              <Input placeholder="587" />
            </div>
            <div className="grid gap-2">
              <Label>Encryption</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Select encryption" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="tls">TLS</SelectItem>
                  <SelectItem value="ssl">SSL</SelectItem>
                  <SelectItem value="none">None</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid gap-2">
            <Label>Username</Label>
            <Input placeholder="smtp@example.com" />
          </div>
          <div className="grid gap-2">
            <Label>Password</Label>
            <Input type="password" />
          </div>
        </CardContent>
      </Card>
    </TabsContent>
  )
}

Component.displayName = 'SettingsEmail'
