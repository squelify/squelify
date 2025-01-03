import * as Lucide from 'lucide-react'
import type { LucideIcon } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle, Progress } from '#/components/base-ui'

interface ResourceUsage {
  label: string
  used: number
  total: number
  unit: string
  icon: LucideIcon
}

const resources: ResourceUsage[] = [
  {
    label: 'Memory Usage',
    used: 3.2,
    total: 8,
    unit: 'GB',
    icon: Lucide.MemoryStick,
  },
  {
    label: 'CPU Usage',
    used: 45,
    total: 100,
    unit: '%',
    icon: Lucide.Cpu,
  },
  {
    label: 'Disk Usage',
    used: 156,
    total: 512,
    unit: 'GB',
    icon: Lucide.HardDrive,
  },
]

export default function CardResources({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="pb-2">
        <CardTitle className="font-medium text-base">System Resources</CardTitle>
      </CardHeader>
      <CardContent className="px-6 py-4">
        <div className="space-y-8 md:space-y-10">
          <div className="space-y-6">
            {resources.map((resource) => {
              const percentage = (resource.used / resource.total) * 100
              return (
                <div key={resource.label} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <resource.icon className="size-4 text-muted-foreground" />
                      <span className="font-medium">{resource.label}</span>
                    </div>
                    <span className="text-muted-foreground">
                      {resource.used} / {resource.total} {resource.unit}
                    </span>
                  </div>
                  <Progress value={percentage} className="h-2" />
                </div>
              )
            })}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between text-sm">
              <span className="font-medium">System Info</span>
            </div>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">OS</p>
                <p className="font-medium">Ubuntu 22.04 LTS</p>
              </div>
              <div>
                <p className="text-muted-foreground">Architecture</p>
                <p className="font-medium">x86_64</p>
              </div>
              <div>
                <p className="text-muted-foreground">Node.js</p>
                <p className="font-medium">v20.11.1</p>
              </div>
              <div>
                <p className="text-muted-foreground">Database</p>
                <p className="font-medium">LibSQL v0.5.3</p>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
