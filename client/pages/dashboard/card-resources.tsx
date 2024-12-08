import * as Lucide from 'lucide-react'
import { useOutletContext } from 'react-router'
import { Button } from '#/components/base-ui/button'
import { Card, CardHeader, CardTitle } from '#/components/base-ui/card'
import { CardContent, CardDescription } from '#/components/base-ui/card'
import { Link } from '#/components/link'
import { AppContextType } from '#/providers/app-provider'

export default function CardResources() {
  const ctx = useOutletContext<AppContextType>()

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Lucide.HelpCircle className="size-5" />
          Resources
        </CardTitle>
        <CardDescription>Quick access to help and documentation</CardDescription>
      </CardHeader>
      <CardContent className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/docs" newTab>
            <Lucide.BookOpen className="mr-2 size-4" />
            <span>Documentation</span>
          </Link>
        </Button>
        <Button variant="outline" className="flex-1" asChild>
          <Link href="/github" newTab>
            <Lucide.LifeBuoy className="mr-2 size-4" />
            <span>Support</span>
          </Link>
        </Button>
        <Button variant="secondary" className="flex-1" onClick={() => ctx.logout()}>
          <Lucide.LogOut className="mr-2 size-4" />
          Sign Out
        </Button>
      </CardContent>
    </Card>
  )
}
