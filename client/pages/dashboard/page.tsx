import * as Lucide from 'lucide-react'
import PageWrapper from '#/layouts/page-wrapper'
import CardSystemMetrics from './card-metrics'
import CardQuickAccess from './card-quick-access'
import CardResources from './card-resources'
import CardStats from './card-stats'

// TODO: add health check here
export default function Page() {
  return (
    <PageWrapper
      title="Dashboard"
      className="container mx-auto mb-8 flex w-full flex-col space-y-4 p-6 md:space-y-8 md:p-6 lg:p-8"
    >
      <div className="grid gap-6">
        {/* Stats Overview */}
        <div className="grid gap-6 md:grid-cols-2">
          <CardStats
            title="API Requests"
            value="2.4k"
            trend={{ label: '24h', value: '+12.5%' }}
            icon={Lucide.Network}
          />
          <CardStats
            title="Active Users"
            value="156"
            trend={{ label: '24h', value: '+3.2%' }}
            icon={Lucide.Users}
          />
        </div>

        {/* Charts */}
        <div className="grid gap-6 md:grid-cols-8">
          <CardSystemMetrics className="md:col-span-6" />
          <CardResources className="md:col-span-2" />
        </div>
      </div>

      {/* Quick Access */}
      <div className="grid gap-4">
        <h2 className="flex items-center gap-2 px-1 font-medium text-lg">
          <Lucide.SquareSlash className="size-5" strokeWidth={2} />
          Quick Access
        </h2>
        <div className="grid gap-6 md:grid-cols-3">
          <CardQuickAccess />
        </div>
      </div>
    </PageWrapper>
  )
}
