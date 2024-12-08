import { useStore } from '@nanostores/react'
import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuLabel, DropdownMenuSeparator } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuCheckboxItem, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { Input } from '#/components/base-ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/base-ui/select'
import { Skeleton } from '#/components/base-ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/base-ui/table'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import { saveUiState, uiStore } from '#/context/stores/ui.store'
import { clx } from '#/utils/helper'
import GridView from './grid-view'

const visibleColumns = [
  { id: 'name', title: 'Name' },
  { id: 'type', title: 'Type' },
  { id: 'size', title: 'Size' },
  { id: 'modified', title: 'Modified' },
]

export default function Component() {
  const { pageTitle } = useSEOMeta('Media Library')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const uiState = useStore(uiStore)
  const viewMode = uiState.viewMode.media

  const skeletonRows = ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5']

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    saveUiState({ viewMode: { media: mode } })
  }

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
          <p className="text-muted-foreground text-sm">Upload and manage your media files</p>
        </div>
        <Button>
          <Lucide.Upload className="mr-2 size-4" />
          Upload Files
        </Button>
      </div>

      {/* Main Content */}
      <div className="space-y-4">
        {/* Search and Filters */}
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-1 items-center gap-2">
            <Input placeholder="Search files..." className="max-w-xs" />
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  <Lucide.Filter className="size-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="start" className="w-48">
                <DropdownMenuLabel>Filter By Type</DropdownMenuLabel>
                <DropdownMenuItem>Images</DropdownMenuItem>
                <DropdownMenuItem>Documents</DropdownMenuItem>
                <DropdownMenuItem>Videos</DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel>Filter By Size</DropdownMenuLabel>
                <DropdownMenuItem>Large (10MB)</DropdownMenuItem>
                <DropdownMenuItem>Medium (1-10MB)</DropdownMenuItem>
                <DropdownMenuItem>Small (1MB)</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          <div className="flex items-center gap-2">
            <Select defaultValue="10">
              <SelectTrigger className="w-[110px]">
                <SelectValue placeholder="10 items" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="10">10 items</SelectItem>
                <SelectItem value="20">20 items</SelectItem>
                <SelectItem value="50">50 items</SelectItem>
                <SelectItem value="100">100 items</SelectItem>
              </SelectContent>
            </Select>

            <Button variant="outline" size="icon" onClick={handleRefresh} disabled={isRefreshing}>
              <Lucide.RotateCw className={clx('size-4', isRefreshing && 'animate-spin')} />
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline" size="icon">
                  {viewMode === 'grid' ? (
                    <Lucide.LayoutGrid className="size-4" />
                  ) : (
                    <Lucide.LayoutList className="size-4" />
                  )}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem onClick={() => handleViewModeChange('list')}>
                  <Lucide.LayoutList className="mr-2 size-4" />
                  List View
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleViewModeChange('grid')}>
                  <Lucide.LayoutGrid className="mr-2 size-4" />
                  Grid View
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>

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

        {/* Bulk Actions Bar */}
        <div className="rounded-md border">
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
                      <Lucide.Download className="mr-2 size-4" />
                      Download
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      <Lucide.Copy className="mr-2 size-4" />
                      Copy Link
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-destructive">
                      <Lucide.Trash2 className="mr-2 size-4" />
                      Delete
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
                <span className="text-muted-foreground text-sm md:ml-2">3 files selected</span>
              </div>
            </div>
          </div>

          {viewMode === 'grid' ? (
            <GridView items={skeletonRows} />
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[40px] pl-3">
                    <Input type="checkbox" className="size-4" />
                  </TableHead>
                  <TableHead>Name</TableHead>
                  <TableHead>Type</TableHead>
                  <TableHead>Size</TableHead>
                  <TableHead>Modified</TableHead>
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
                      <div className="flex items-center gap-2">
                        <div className="size-10 rounded-lg border bg-muted" />
                        <Skeleton className="h-4 w-[150px] bg-muted" />
                      </div>
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[80px] bg-muted" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[60px] bg-muted" />
                    </TableCell>
                    <TableCell>
                      <Skeleton className="h-4 w-[100px] bg-muted" />
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-1">
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                          <Lucide.Download className="size-4" />
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
          )}
        </div>

        {/* Table Info */}
        <div className="flex items-center justify-end text-muted-foreground text-sm">
          Showing 1-5 of 100 files
        </div>
      </div>
    </div>
  )
}

Component.displayName = 'MediaLibraryPage'
