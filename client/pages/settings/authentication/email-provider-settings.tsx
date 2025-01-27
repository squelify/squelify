import * as React from 'react'
import { Input, Label, NumberInput } from '#/components/base-ui'

export function EmailProviderSettings() {
  return (
    <React.Fragment>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Password Requirements</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <NumberInput
                placeholder="Minimum length"
                className="w-full"
                defaultValue={8}
                min={6}
              />
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
              <NumberInput placeholder="Maximum attempts" className="w-full" max={100} min={0} />
              <p className="text-muted-foreground text-xs">Before account lockout</p>
            </div>
            <div className="grid gap-2">
              <NumberInput placeholder="Lockout duration" className="w-full" min={0} />
              <p className="text-muted-foreground text-xs">Duration in minutes</p>
            </div>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
