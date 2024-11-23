import * as Lucide from 'lucide-react'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '#/components/base-ui/accordion'
import { Badge } from '#/components/base-ui/badge'
import { Button } from '#/components/base-ui/button'
import { Input } from '#/components/base-ui/input'
import { Label } from '#/components/base-ui/label'
import { Separator } from '#/components/base-ui/separator'

const providers = [
  {
    id: 'email',
    name: 'Email/Password',
    description: 'Traditional email and password authentication',
    status: 'active' as const,
    icon: <Lucide.Mail className="h-5 w-5" />,
  },
  {
    id: 'github',
    name: 'GitHub',
    description: 'OAuth authentication with GitHub',
    status: 'configured' as const,
    icon: <Lucide.Github className="h-5 w-5" />,
  },
  {
    id: 'google',
    name: 'Google',
    description: 'OAuth authentication with Google',
    status: 'not_configured' as const,
    icon: <Lucide.Globe className="h-5 w-5" />,
  },
  {
    id: 'apple',
    name: 'Apple',
    description: 'OAuth authentication with Apple',
    status: 'not_configured' as const,
    icon: <Lucide.Apple className="h-5 w-5" />,
  },
  {
    id: 'twitter',
    name: 'Twitter',
    description: 'OAuth authentication with Twitter',
    status: 'not_configured' as const,
    icon: <Lucide.Twitter className="h-5 w-5" />,
  },
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'OAuth authentication with Facebook',
    status: 'not_configured' as const,
    icon: <Lucide.Facebook className="h-5 w-5" />,
  },
]

export function AuthProviderForm() {
  return (
    <Accordion type="single" collapsible className="w-full space-y-4">
      {providers.map((provider) => (
        <AccordionItem value={provider.id} key={provider.id} className="rounded-lg border">
          <AccordionTrigger className="px-6 py-4 hover:no-underline [&[data-state=open]>svg]:rotate-180">
            <div className="flex w-full items-center gap-4">
              <div className="shrink-0 rounded-lg border bg-muted/50 p-2.5">{provider.icon}</div>
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex w-full items-center justify-between gap-4 pr-4">
                  <div className="flex flex-col items-start justify-start">
                    <h4 className="font-medium text-sm">{provider.name}</h4>
                    <p className="text-left text-muted-foreground text-sm">
                      {provider.description}
                    </p>
                  </div>
                  <Badge
                    variant={
                      provider.status === 'active'
                        ? 'default'
                        : provider.status === 'configured'
                          ? 'secondary'
                          : 'outline'
                    }
                    className="shrink-0 font-medium text-xs"
                  >
                    {provider.status === 'active'
                      ? 'Active'
                      : provider.status === 'configured'
                        ? 'Configured'
                        : 'Not Configured'}
                  </Badge>
                </div>
              </div>
            </div>
          </AccordionTrigger>

          <AccordionContent>
            <Separator />
            <div className="grid gap-6 p-6">
              {provider.id === 'email' ? (
                <>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Password Requirements</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Input type="number" placeholder="Minimum length" />
                          <p className="text-muted-foreground text-xs">
                            Minimum characters required
                          </p>
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
                </>
              ) : (
                <>
                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>OAuth Credentials</Label>
                      <div className="grid gap-4 sm:grid-cols-2">
                        <div className="grid gap-2">
                          <Input placeholder="Client ID" className="font-mono" />
                          <p className="text-muted-foreground text-xs">OAuth client identifier</p>
                        </div>
                        <div className="grid gap-2">
                          <Input
                            type="password"
                            placeholder="Client Secret"
                            className="font-mono"
                          />
                          <p className="text-muted-foreground text-xs">Keep this value secure</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Callback URL</Label>
                      <div className="grid gap-2">
                        <div className="flex gap-2">
                          <Input
                            readOnly
                            value={`https://example.com/auth/${provider.id}/callback`}
                            className="w-full bg-muted/50 font-mono text-sm"
                          />
                          <Button variant="outline" size="icon" className="shrink-0">
                            <Lucide.Copy className="h-4 w-4" />
                          </Button>
                        </div>
                        <p className="text-muted-foreground text-xs">
                          Use this URL in your {provider.name} OAuth settings
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="grid gap-4">
                    <div className="space-y-2">
                      <Label>OAuth Scopes</Label>
                      <div className="grid gap-2">
                        <Input placeholder="email profile openid" className="font-mono" />
                        <p className="text-muted-foreground text-xs">
                          Space-separated list of required OAuth scopes
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}

              <div className="flex items-center justify-end gap-2">
                {provider.status !== 'not_configured' && (
                  <Button variant="outline" className="text-destructive hover:text-destructive">
                    <Lucide.Power className="mr-2 h-4 w-4" />
                    Disable
                  </Button>
                )}
                <Button>
                  {provider.status === 'not_configured' ? 'Configure' : 'Save Changes'}
                </Button>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      ))}
    </Accordion>
  )
}
