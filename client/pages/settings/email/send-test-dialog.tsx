import { useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { Dialog, DialogContent, DialogDescription } from '#/components/base-ui/dialog'
import { DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '#/components/base-ui/dialog'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'

export default function SendTestEmailDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="outline">Send Test Email</Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Send Test Email</DialogTitle>
          <DialogDescription>Send a test email to verify your SMTP configuration</DialogDescription>
        </DialogHeader>
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="recipient">Recipient Email</Label>
            <Input id="recipient" placeholder="Enter recipient email address" type="email" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
          <Button
            onClick={() => {
              // TODO: Implement send test email
              setIsOpen(false)
            }}
          >
            Send Test
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
