import type { LucideIcon } from 'lucide-react'

export interface StatsCardProps {
  title: string
  value: string | number | React.ReactElement
  trend: {
    label: string
    value: string | React.ReactElement
  }
  icon: LucideIcon
  className?: string
}

export interface ResourceMetric {
  time: string
  cpu: number
  memory: number
  disk: number
}

export interface QuickAction {
  title: string
  icon: LucideIcon
  href: string
  description: string
}
