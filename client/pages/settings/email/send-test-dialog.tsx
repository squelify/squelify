import { useState } from 'react'
import { Button, Input, Label } from '#/components/base-ui'
import { Dialog, DialogContent, DialogDescription } from '#/components/base-ui'
import { DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '#/components/base-ui'

export default function SendTestEmailDialog() {
  const [isOpen, setIsOpen] = useState(false)

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost">Send Test Email</Button>
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
            // TODO: Implement send test email
            onClick={() => {
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
