import React from 'react'
import { Input, Label } from '#/components/base-ui'

export function EmailProviderSettings() {
  return (
    <React.Fragment>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Password Requirements</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Input type="number" placeholder="Minimum length" />
              <p className="text-muted-foreground text-xs">Minimum characters required</p>
            </div>
            <div className="grid gap-2">
              <Input placeholder="Required characters" />
              <p className="text-muted-foreground text-xs">e.g. !@#$%^&*()</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Security Policy</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Input type="number" placeholder="Maximum attempts" />
              <p className="text-muted-foreground text-xs">Before account lockout</p>
            </div>
            <div className="grid gap-2">
              <Input type="number" placeholder="Lockout duration" />
              <p className="text-muted-foreground text-xs">Duration in minutes</p>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
