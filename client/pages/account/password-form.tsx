import { Button } from '#/components/base-ui/button'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'

export function PasswordForm() {
  return (
    <div className="grid gap-4">
      <div className="grid gap-2">
        <Label htmlFor="current">Current Password</Label>
        <Input id="current" type="password" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="new">New Password</Label>
        <Input id="new" type="password" />
      </div>
      <div className="grid gap-2">
        <Label htmlFor="confirm">Confirm Password</Label>
        <Input id="confirm" type="password" />
      </div>
      <div className="flex justify-end">
        <Button>Update Password</Button>
      </div>
    </div>
  )
}
