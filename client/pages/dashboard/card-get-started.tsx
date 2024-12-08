import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'
import { Card, CardHeader, CardTitle } from '#/components/base-ui/card'
import { CardContent, CardDescription } from '#/components/base-ui/card'
import { Link } from '#/components/link'

export default function CardGetStarted() {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lucide.Rocket className="size-5" />
          Get Started with Squelify
        </CardTitle>
        <CardDescription>Quick setup guides and essential features</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lucide.LockKeyhole className="size-4" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-3 space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Set up user authentication with:</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Email/Password</li>
                <li>OAuth providers</li>
                <li>Two-factor (2FA)</li>
                <li>Passkey (WebAuthn)</li>
              </ul>
            </div>
            <div className="inline-flex w-full items-center justify-between gap-2">
              {[
                { label: 'Manage Users', icon: Lucide.Users2, href: '/settings/api/keys/new' },
                { label: 'Roles & Permissions', icon: Lucide.Shield, href: '/settings/api' },
              ].map((action) => (
                <Button key={action.label} variant="outline" size="sm" className="w-full" asChild>
                  <Link href={action.href}>
                    <action.icon className="-ml-1 mr-1 size-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lucide.Image className="size-4" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-3 space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Create and manage content types:</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Dynamic content types</li>
                <li>Flexible modeling</li>
                <li>Rich text editor</li>
                <li>Media library</li>
              </ul>
            </div>
            <div className="inline-flex w-full items-center justify-between gap-2">
              {[
                { label: 'New Content', icon: Lucide.Plus, href: '/content/new' },
                { label: 'Browse Media', icon: Lucide.FolderOpen, href: '/media' },
              ].map((action) => (
                <Button key={action.label} variant="outline" size="sm" className="w-full" asChild>
                  <Link href={action.href}>
                    <action.icon className="-ml-1 mr-1 size-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lucide.Blocks className="size-4" />
              Developer Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-3 space-y-6">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Access developer features:</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>RESTful API</li>
                <li>Real-time subscriptions</li>
                <li>Role-based access</li>
                <li>Webhooks</li>
              </ul>
            </div>
            <div className="inline-flex w-full items-center justify-between gap-2">
              {[
                { label: 'API Keys', icon: Lucide.Key, href: '/settings/api/keys/new' },
                { label: 'Webhooks', icon: Lucide.Webhook, href: '/settings/api' },
              ].map((action) => (
                <Button key={action.label} variant="outline" size="sm" className="w-full" asChild>
                  <Link href={action.href}>
                    <action.icon className="-ml-1 mr-1 size-4" />
                    {action.label}
                  </Link>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
