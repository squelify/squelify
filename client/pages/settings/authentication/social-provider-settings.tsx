import * as React from 'react'
import { Input, Label } from '#/components/base-ui'

interface SocialProviderSettingsProps {
  providerId: string
  providerName: string
}

export function SocialProviderSettings({ providerId, providerName }: SocialProviderSettingsProps) {
  return (
    <React.Fragment>
      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>OAuth Credentials</Label>
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="grid gap-2">
              <Input placeholder="Client ID" />
              <p className="text-muted-foreground text-xs">OAuth client identifier</p>
            </div>
            <div className="grid gap-2">
              <Input type="password" placeholder="Client Secret" />
              <p className="text-muted-foreground text-xs">Keep this value secure</p>
            </div>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>Callback URL</Label>
          <div className="grid gap-2">
            <Input
              readOnly
              value={`https://example.com/auth/${providerId}/callback`}
              className="w-full bg-muted/50 font-mono text-sm"
              showCopyButton
            />
            <p className="text-muted-foreground text-xs">
              Use this URL in your {providerName} OAuth settings
            </p>
          </div>
        </div>
      </div>

      <div className="grid gap-4">
        <div className="space-y-2">
          <Label>OAuth Scopes</Label>
          <div className="grid gap-2">
            <Input placeholder="email profile openid" />
            <p className="text-muted-foreground text-xs">
              Space-separated list of required OAuth scopes
            </p>
          </div>
        </div>
      </div>
    </React.Fragment>
  )
}
