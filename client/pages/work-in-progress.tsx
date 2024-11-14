import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'
import { Card, CardContent, CardDescription } from '#/components/base-ui/card'
import { CardHeader, CardTitle } from '#/components/base-ui/card'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Component() {
  useSEOMeta('Work in Progress')

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Construction className="size-5" />
            Work in Progress
          </CardTitle>
          <CardDescription>This feature is currently under development</CardDescription>
        </CardHeader>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lucide.Clock className="size-5" />
              Development Status
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center py-2">
              <Lucide.HardHat className="size-24 text-brand-500" />
            </div>
            <p className="text-center text-muted-foreground">
              We're working hard to bring you something amazing. <br /> Please check back later!
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lucide.Lightbulb className="size-5" />
              What to Expect
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <Lucide.CheckCircle2 className="mt-0.5 size-5 text-green-500" />
                <div>
                  <p className="font-medium">Enhanced Features</p>
                  <p className="text-muted-foreground text-sm">
                    New tools and capabilities coming soon
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lucide.CheckCircle2 className="mt-0.5 size-5 text-green-500" />
                <div>
                  <p className="font-medium">Improved Performance</p>
                  <p className="text-muted-foreground text-sm">
                    Optimized for better speed and reliability
                  </p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <Lucide.CheckCircle2 className="mt-0.5 size-5 text-green-500" />
                <div>
                  <p className="font-medium">Better Integration</p>
                  <p className="text-muted-foreground text-sm">
                    Seamless connection with existing systems
                  </p>
                </div>
              </li>
            </ul>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.HelpCircle className="size-5" />
            Need Assistance?
          </CardTitle>
          <CardDescription>Get help or learn more about upcoming features</CardDescription>
        </CardHeader>
        <CardContent className="flex gap-4">
          <Button variant="outline" className="flex-1">
            <Lucide.BookOpen className="mr-2 size-4" />
            Documentation
          </Button>
          <Button variant="outline" className="flex-1">
            <Lucide.LifeBuoy className="mr-2 size-4" />
            Support
          </Button>
          <Button variant="secondary" className="flex-1">
            <Lucide.Bell className="mr-2 size-4" />
            Get Notified
          </Button>
        </CardContent>
      </Card>
    </div>
  )
}

Component.displayName = 'WorkInProgressPage'
