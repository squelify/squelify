import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuLabel, DropdownMenuSeparator } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuCheckboxItem, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { Input } from '#/components/base-ui/input'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui/select'
import { SelectContent, SelectItem } from '#/components/base-ui/select'
import { Skeleton } from '#/components/base-ui/skeleton'
import { Table, TableHead, TableHeader } from '#/components/base-ui/table'
import { TableBody, TableCell, TableRow } from '#/components/base-ui/table'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import { clx } from '#/utils/helper'

const visibleColumns = [
  { id: 'name', title: 'Name' },
  { id: 'key', title: 'API Key' },
  { id: 'scopes', title: 'Scopes' },
  { id: 'lastUsed', title: 'Last Used' },
  { id: 'expires', title: 'Expires' },
  { id: 'status', title: 'Status' },
]

export default function Page() {
  const { pageTitle } = useSEOMeta('API Keys')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const skeletonRows = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5']

  const handleRefresh = () => {
    setIsRefreshing(true)
    setTimeout(() => setIsRefreshing(false), 1000)
  }

  return (
    <div className="container mx-auto w-full space-y-4 p-4 md:space-y-6 md:p-6 lg:p-8">
      {/* Header Section */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">{pageTitle}</h1>
          <p className="text-muted-foreground text-sm">
            Manage API keys for accessing your application
          </p>
        </div>
        <Button>
          <Lucide.Plus className="mr-2 size-4" />
          Generate API Key
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input placeholder="Search API keys..." className="max-w-sm" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Lucide.Filter className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter By Scope</DropdownMenuLabel>
                <DropdownMenuItem>Read Only</DropdownMenuItem>
                <DropdownMenuItem>Read & Write</DropdownMenuItem>
                <DropdownMenuItem>Full Access</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter By Status</DropdownMenuLabel>
                <DropdownMenuItem>Active</DropdownMenuItem>
                <DropdownMenuItem>Expired</DropdownMenuItem>
                <DropdownMenuItem>Revoked</DropdownMenuItem>
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
                      <Lucide.RefreshCw className="mr-2 size-4" />
                      Regenerate
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lucide.Ban className="mr-2 size-4" />
                      Revoke
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Lucide.Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-muted-foreground text-sm md:ml-2">3 keys selected</span>
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
                <TableHead>API Key</TableHead>
                <TableHead>Scopes</TableHead>
                <TableHead>Last Used</TableHead>
                <TableHead>Expires</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Actions</TableHead>
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
                    <Skeleton className="h-4 w-[100px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[100px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[80px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <Skeleton className="h-4 w-[60px] bg-muted" />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <Button variant="ghost" size="icon" className="hover:bg-muted">
                        <Lucide.RefreshCw className="size-4" />
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
          Showing 1-5 of 100 API keys
        </div>
      </div>
    </div>
  )
}
