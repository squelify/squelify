import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem } from '#/components/base-ui'
import { DropdownMenuLabel, DropdownMenuSeparator } from '#/components/base-ui'
import { DropdownMenuCheckboxItem, DropdownMenuTrigger } from '#/components/base-ui'
import { Button, Input, Skeleton } from '#/components/base-ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/base-ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/base-ui'
import PageWrapper from '#/layouts/page-wrapper'
import { clx } from '#/utils/helper'

const visibleColumns = [
  { id: 'name', title: 'Name' },
  { id: 'url', title: 'URL' },
  { id: 'events', title: 'Events' },
  { id: 'lastDelivery', title: 'Last Delivery' },
  { id: 'status', title: 'Status' },
]

export default function Page() {
  const [isRefreshing, setIsRefreshing] = useState(false)
  const skeletonRows = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5']

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <PageWrapper
      title="Webhooks"
      className="container mx-auto w-full space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8"
    >
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">Webhooks</h1>
          <p className="text-muted-foreground text-sm">
            Manage webhook endpoints and event subscriptions
          </p>
        </div>
        <Button>
          <Lucide.Plus className="mr-2 size-4" />
          Add Webhook
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input placeholder="Search webhooks..." className="max-w-sm" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Lucide.Filter className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter By Event</DropdownMenuLabel>
                <DropdownMenuItem>User Created</DropdownMenuItem>
                <DropdownMenuItem>User Updated</DropdownMenuItem>
                <DropdownMenuItem>Content Changed</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Disabled</DropdownMenuItem>
                <DropdownMenuItem>Failed</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Select defaultValue="10">
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="10 rows" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5 rows</SelectItem>
                <SelectItem value="10">10 rows</SelectItem>
                <SelectItem value="20">20 rows</SelectItem>
                <SelectItem value="50">50 rows</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <Lucide.RotateCw className={clx('size-4', isRefreshing && 'animate-spin')} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Lucide.Settings2 className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {visibleColumns.map((column) => (
                  <DropdownMenuCheckboxItem key={column.id} className="capitalize" checked={true}>
                    {column.title}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        {/* Table Section */}
        <div className="rounded-md border">
          {/* Bulk Actions Bar */}
          <div className="border-b bg-muted/50 px-0 py-2">
            <div className="flex items-center gap-2">
              <div className="w-[40px] pl-3">
                <Input type="checkbox" className="size-4" />
              </div>
              <div className="flex flex-1 items-center justify-between gap-2 pr-4 md:justify-start">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button variant="outline" size="sm">
                      Actions
                      <Lucide.ChevronDown className="ml-2 size-4" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="start">
                    <DropdownMenuItem>
                      <Lucide.Play className="mr-2 size-4" />
                      Enable
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lucide.Pause className="mr-2 size-4" />
                      Disable
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Lucide.Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-muted-foreground text-sm md:ml-2">3 webhooks selected</span>
              </div>
            </div>
          </div>

          {/* Table Content */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead className="w-[40px] pl-3">
                  <Input type="checkbox" className="size-4" />
                </TableHead>
                <TableHead>Name</TableHead>
                <TableHead>URL</TableHead>
                <TableHead>Events</TableHead>
                <TableHead>Last Delivery</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[120px]">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((key) => (
                <TableRow key={key}>
                  <TableCell className="pl-3">
                    <Input type="checkbox" className="size-4" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Skeleton className="h-4 w-[200px] bg-muted" />
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <Lucide.Copy className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <Lucide.History className="size-4" />
                      </Button>
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <Lucide.MoreHorizontal className="size-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Table Info */}
        <div className="flex items-center justify-end text-muted-foreground text-sm">
          Showing 1-5 of 100 webhooks
        </div>
      </div>
    </PageWrapper>
  )
}
