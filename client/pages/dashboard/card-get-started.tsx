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
              <Lucide.Key className="size-4" />
              Authentication
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-2 space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Set up user authentication with:</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Email/Password</li>
                <li>OAuth providers</li>
                <li>Two-factor (2FA)</li>
                <li>Passkey (WebAuthn)</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/settings/auth">
                <Lucide.ArrowRight className="mr-2 size-4" />
                <span>Configure Auth</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lucide.Database className="size-4" />
              Content Management
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-2 space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Start managing content with:</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>Dynamic content types</li>
                <li>Flexible modeling</li>
                <li>Rich text editor</li>
                <li>Media library</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/content">
                <Lucide.ArrowRight className="mr-2 size-4" />
                <span>Create Content</span>
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Lucide.Wrench className="size-4" />
              Developer Tools
            </CardTitle>
          </CardHeader>
          <CardContent className="-mt-2 space-y-4">
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">Access developer features:</p>
              <ul className="list-inside list-disc space-y-1 text-sm">
                <li>RESTful API</li>
                <li>Real-time subscriptions</li>
                <li>Role-based access</li>
                <li>Webhooks</li>
              </ul>
            </div>
            <Button variant="outline" className="w-full" asChild>
              <Link href="/docs" newTab>
                <Lucide.ArrowRight className="mr-2 size-4" />
                <span>View API Docs</span>
              </Link>
            </Button>
          </CardContent>
        </Card>
      </CardContent>
    </Card>
  )
}
