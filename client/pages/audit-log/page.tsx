import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Button, Input, Skeleton } from '#/components/base-ui'
import { DropdownMenu, DropdownMenuItem } from '#/components/base-ui'
import { DropdownMenuCheckboxItem, DropdownMenuTrigger } from '#/components/base-ui'
import { DropdownMenuContent, DropdownMenuLabel, DropdownMenuSeparator } from '#/components/base-ui'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '#/components/base-ui'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '#/components/base-ui'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import PageWrapper from '#/layouts/page-wrapper'
import { clx } from '#/utils/helper'

const visibleColumns = [
  { id: 'timestamp', title: 'Timestamp' },
  { id: 'action', title: 'Action' },
  { id: 'entity', title: 'Entity' },
  { id: 'user', title: 'User' },
  { id: 'ipAddress', title: 'IP Address' },
  { id: 'changes', title: 'Changes' },
]

export default function Page() {
  const { pageTitle } = useSEOMeta('Audit Log')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const skeletonRows = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5']

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <PageWrapper className="container mx-auto w-full space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">
            Track and monitor all activities across your organization
          </p>
        </div>
        <Button variant="outline">
          <Lucide.Download className="mr-2 size-4" />
          Export Logs
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input placeholder="Search logs..." className="max-w-sm" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Lucide.Filter className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter By Action</DropdownMenuLabel>
                <DropdownMenuItem>Create</DropdownMenuItem>
                <DropdownMenuItem>Update</DropdownMenuItem>
                <DropdownMenuItem>Delete</DropdownMenuItem>
                <DropdownMenuItem>Login</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter By Entity</DropdownMenuLabel>
                <DropdownMenuItem>User</DropdownMenuItem>
                <DropdownMenuItem>Organization</DropdownMenuItem>
                <DropdownMenuItem>Content</DropdownMenuItem>
                <DropdownMenuItem>Settings</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Select defaultValue="24h">
              <SelectTrigger className="w-[130px]">
                <SelectValue placeholder="Time Range" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1h">Last hour</SelectItem>
                <SelectItem value="24h">Last 24 hours</SelectItem>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="custom">Custom range</SelectItem>
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
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Timestamp</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Entity</TableHead>
                <TableHead>User</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Changes</TableHead>
                <TableHead className="w-[120px]">Details</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {skeletonRows.map((key) => (
                <TableRow key={key}>
                  <TableCell>
                    <Skeleton className="h-4 w-[120px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[150px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[200px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <Lucide.Eye className="size-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        {/* Table Info */}
        <div className="flex items-center justify-between">
          <span className="text-muted-foreground text-sm">Showing last 100 activities</span>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" disabled>
              Previous
            </Button>
            <Button variant="outline" size="sm">
              Next
            </Button>
          </div>
        </div>
      </div>
    </PageWrapper>
  )
}
