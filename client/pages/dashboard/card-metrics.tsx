import * as Lucide from 'lucide-react'
import { Line, LineChart, XAxis, YAxis } from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '#/components/base-ui'
import { ChartContainer, ChartTooltip } from '#/components/base-ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/base-ui'
import type { ResourceMetric } from './types'

const resourceData: ResourceMetric[] = [
  { time: '00:00', cpu: 45, memory: 60, disk: 30 },
  { time: '04:00', cpu: 55, memory: 65, disk: 30 },
  { time: '08:00', cpu: 75, memory: 70, disk: 32 },
  { time: '12:00', cpu: 85, memory: 75, disk: 35 },
  { time: '16:00', cpu: 65, memory: 68, disk: 35 },
  { time: '20:00', cpu: 50, memory: 62, disk: 35 },
]

const resourceConfig = {
  cpu: {
    label: 'CPU Usage',
    theme: { light: '#2563eb', dark: '#3b82f6' },
  },
  memory: {
    label: 'Memory Usage',
    theme: { light: '#16a34a', dark: '#22c55e' },
  },
  disk: {
    label: 'Disk Usage',
    theme: { light: '#dc2626', dark: '#ef4444' },
  },
}

export default function CardSystemMetrics({ className }: { className?: string }) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="font-medium text-base">System Resources</CardTitle>
        <Select defaultValue="24h">
          <SelectTrigger className="h-8 w-[140px]">
            <SelectValue placeholder="Select range" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="1h">Last hour</SelectItem>
            <SelectItem value="24h">Last 24 hours</SelectItem>
            <SelectItem value="7d">Last 7 days</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="pt-4 pr-8 pl-0">
        <ChartContainer className="h-[340px] w-full" config={resourceConfig}>
          <LineChart data={resourceData}>
            <XAxis dataKey="time" />
            <YAxis />
            <ChartTooltip />
            <Line
              type="monotone"
              dataKey="cpu"
              stroke="var(--color-cpu)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="memory"
              stroke="var(--color-memory)"
              strokeWidth={2}
              dot={false}
            />
            <Line
              type="monotone"
              dataKey="disk"
              stroke="var(--color-disk)"
              strokeWidth={2}
              dot={false}
            />
          </LineChart>
        </ChartContainer>
      </CardContent>
    </Card>
  )
}
