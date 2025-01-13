import * as Lucide from 'lucide-react'
import { Card, CardContent, CardHeader } from '#/components/base-ui'
import { CardDescription, CardTitle } from '#/components/base-ui'
import { Badge, ScrollArea, TabsContent } from '#/components/base-ui'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

interface LoginHistoryItem {
  id: string
  timestamp: number
  ipAddress: string
  userAgent: string
  location: string
  status: 'success' | 'failed'
  device: 'mobile' | 'desktop' | 'tablet'
}

export default function Page() {
  useSEOMeta('Login History')

  const historyItems: LoginHistoryItem[] = [
    {
      id: '1',
      timestamp: Date.now() - 1000 * 60 * 5, // 5 menit yang lalu
      ipAddress: '192.168.1.1',
      userAgent: 'Chrome/120.0.0.0',
      location: 'Jakarta, Indonesia',
      status: 'success',
      device: 'desktop',
    },
    {
      id: '2',
      timestamp: Date.now() - 1000 * 60 * 60, // 1 jam yang lalu
      ipAddress: '192.168.1.2',
      userAgent: 'Mobile Safari/604.1',
      location: 'Bandung, Indonesia',
      status: 'failed',
      device: 'mobile',
    },
  ]

  const getDeviceIcon = (device: LoginHistoryItem['device']) => {
    switch (device) {
      case 'mobile':
        return <Lucide.Smartphone className="size-4" />
      case 'tablet':
        return <Lucide.Tablet className="size-4" />
      default:
        return <Lucide.Monitor className="size-4" />
    }
  }

  const getRelativeTime = (timestamp: number) => {
    const rtf = new Intl.RelativeTimeFormat('id', { numeric: 'auto' })
    const diff = timestamp - Date.now()
    const diffMinutes = Math.round(diff / (1000 * 60))
    const diffHours = Math.round(diff / (1000 * 60 * 60))
    const diffDays = Math.round(diff / (1000 * 60 * 60 * 24))

    if (Math.abs(diffMinutes) < 60) return rtf.format(diffMinutes, 'minute')
    if (Math.abs(diffHours) < 24) return rtf.format(diffHours, 'hour')
    return rtf.format(diffDays, 'day')
  }

  const getStatusIcon = (status: LoginHistoryItem['status']) => {
    if (status === 'success') {
      return <div className="size-2 rounded-full bg-green-500 ring-4 ring-green-500/20" />
    }
    return <div className="size-2 rounded-full bg-red-500 ring-4 ring-red-500/20" />
  }

  return (
    <TabsContent value="login-history">
      <Card>
        <CardHeader className="space-y-1">
          <CardTitle>Login History</CardTitle>
          <CardDescription>Review your recent login activities</CardDescription>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-[400px] rounded-md">
            <div className="space-y-4">
              {historyItems.map((item) => (
                <div
                  key={item.id}
                  className="group relative rounded-lg border p-4 transition-colors hover:bg-muted/50"
                >
                  <div className="flex items-center gap-4">
                    <div className="shrink-0">{getStatusIcon(item.status)}</div>

                    <div className="flex-1 space-y-1">
                      <div className="flex items-center gap-2">
                        <p className="font-medium">{item.location}</p>
                        <Badge variant={item.status === 'success' ? 'default' : 'destructive'}>
                          {item.status}
                        </Badge>
                      </div>

                      <div className="flex items-center gap-4 text-muted-foreground text-sm">
                        <div className="flex items-center gap-1">
                          <Lucide.Globe2 className="size-3.5" />
                          <span>{item.ipAddress}</span>
                        </div>
                        <Tooltip>
                          <TooltipTrigger className="flex items-center gap-1">
                            {getDeviceIcon(item.device)}
                            <span>{item.userAgent}</span>
                          </TooltipTrigger>
                          <TooltipContent>
                            <p>Browser: {item.userAgent}</p>
                          </TooltipContent>
                        </Tooltip>
                      </div>
                    </div>

                    <div className="text-right">
                      <Tooltip>
                        <TooltipTrigger className="text-muted-foreground text-sm">
                          {getRelativeTime(item.timestamp)}
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>{new Date(item.timestamp).toLocaleString()}</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </TabsContent>
  )
}
