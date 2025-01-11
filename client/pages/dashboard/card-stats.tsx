import { Card, CardContent } from '#/components/base-ui'
import type { StatsCardProps } from './types'
export default function CardStats({ title, value, trend, icon: Icon, className }: StatsCardProps) {
  return (
    <Card className={className}>
      <CardContent className="pt-6">
        <div className="flex items-center justify-between">
          <Icon className="size-5 text-muted-foreground" aria-hidden="true" />
          <span className="font-medium text-muted-foreground text-xs">{title}</span>
        </div>
        <div className="mt-4 space-y-2">
          <p className="font-semibold text-2xl tracking-tight">{value}</p>
          <p className="text-muted-foreground text-xs">
            <span>{trend.label}</span>
            <span aria-hidden="true"> • </span>
            <span>{trend.value}</span>
          </p>
        </div>
      </CardContent>
    </Card>
  )
}
