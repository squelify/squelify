import { useStore } from '@nanostores/react'
import * as Lucide from 'lucide-react'
import { useCallback, useMemo, useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuLabel, DropdownMenuSeparator } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuCheckboxItem, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { Input } from '#/components/base-ui/input'
import { Select, SelectItem, SelectValue } from '#/components/base-ui/select'
import { SelectContent, SelectTrigger } from '#/components/base-ui/select'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import { saveUiState, uiStore } from '#/context/stores/ui.store'
import { clx } from '#/utils/helper'

import { type MediaItem, generateDummyMedia } from './dummy'
import GridView, { GridViewSkeleton } from './grid-view'
import ListView, { ListViewSkeleton } from './list-view'

const visibleColumns = [
  { id: 'name', title: 'Name' },
  { id: 'type', title: 'Type' },
  { id: 'size', title: 'Size' },
  { id: 'modified', title: 'Modified' },
]

export default function Page() {
  const { pageTitle } = useSEOMeta('Media Library')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [items, setItems] = useState<MediaItem[]>(() => generateDummyMedia(20))
  const uiState = useStore(uiStore)
  const viewMode = uiState.viewMode.media

  const handleViewModeChange = (mode: 'grid' | 'list') => {
    saveUiState({ viewMode: { media: mode } })
  }

  const handleRefresh = useCallback(async () => {
    setIsRefreshing(true)

    try {
      // Simulate API call delay
      await new Promise((resolve) => setTimeout(resolve, 800))
      // Generate fresh data
      setItems(generateDummyMedia(20))
    } finally {
      setIsRefreshing(false)
    }
  }, [])

  const renderContent = useMemo(() => {
    if (isRefreshing) {
      return viewMode === 'grid' ? <GridViewSkeleton /> : <ListViewSkeleton />
    }
    return viewMode === 'grid' ? <GridView items={items} /> : <ListView items={items} />
  }, [isRefreshing, viewMode, items])

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
            <Input placeholder="Search files..." className="max-w-sm" />
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
          {renderContent}
        </div>

        {/* Table Info */}
        <div className="flex items-center justify-end text-muted-foreground text-sm">
          Showing 1-5 of 100 files
        </div>
      </div>
    </div>
  )
}
