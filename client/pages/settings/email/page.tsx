import { Button, Input, Label, Separator, TabsContent } from '#/components/base-ui'
import { Card, CardContent, CardFooter, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui'
import { SelectContent, SelectItem } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import SendTestEmailDialog from './send-test-dialog'

export default function Page() {
  useSEOMeta('Email Settings')

  return (
    <TabsContent value="email" tabIndex={-1}>
      <Card>
        <CardHeader className="md:px-10">
          <CardTitle>Email Configuration</CardTitle>
          <CardDescription>Configure email delivery settings</CardDescription>
        </CardHeader>
        <Separator />
        <CardContent className="grid gap-6 pt-6 pb-8 md:px-10">
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
        <Separator />
        <CardFooter className="flex justify-between pt-6 md:px-10">
          <SendTestEmailDialog />
          <Button>Save Changes</Button>
        </CardFooter>
      </Card>
    </TabsContent>
  )
}
