import * as Lucide from 'lucide-react'
import { useOutletContext } from 'react-router'
import { Card, CardDescription, CardHeader, CardTitle } from '#/components/base-ui/card'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import type { AppContextType } from '#/providers/app-provider'
import CardGetStarted from './card-get-started'
import CardInfoStatus from './card-info-status'
import CardResources from './card-resources'

export default function Page() {
  useSEOMeta('Dashboard')
  const ctx = useOutletContext<AppContextType>()

  return (
    <div className="mx-auto w-full max-w-screen-xl space-y-6 px-6 py-8">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Lucide.Activity className="size-5" />
            System Overview
          </CardTitle>
          <CardDescription>Welcome back, {ctx.user?.displayName}!</CardDescription>
        </CardHeader>
      </Card>
      <CardInfoStatus />
      <CardGetStarted />
      <CardResources />
    </div>
  )
}
