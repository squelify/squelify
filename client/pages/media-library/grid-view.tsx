import * as Lucide from 'lucide-react'
import { Button, Card, CardContent, Input, Skeleton } from '#/components/base-ui'
import { Dialog, DialogContent, DialogTrigger } from '#/components/base-ui'
import { DialogHeader, DialogTitle } from '#/components/base-ui'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/base-ui'
import { type MediaItem } from './dummy'

interface GridViewProps {
  items: MediaItem[]
}

export const GridViewSkeleton = () => (
  <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
    {Array.from({ length: 10 }).map((val) => (
      <Card key={`skeleton-${val}`} className="group relative overflow-hidden">
        <CardContent className="aspect-square p-0">
          {/* Checkbox */}
          <div className="absolute top-2 left-2 z-10">
            <Skeleton className="size-4 rounded-sm" />
          </div>

          {/* Preview */}
          <div className="relative size-full">
            <Skeleton className="size-full" />

            {/* Eye Icon Placeholder */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Skeleton className="size-8 rounded-md" />
            </div>
          </div>

          {/* File Info */}
          <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 p-2">
            <div className="flex flex-col">
              <Skeleton className="mb-1 h-4 w-32" />
              <Skeleton className="h-3 w-20" />
            </div>
            <Skeleton className="size-8 rounded-md" />
          </div>
        </CardContent>
      </Card>
    ))}
  </div>
)

export default function GridView({ items }: GridViewProps) {
  const formatFileSize = (bytes: number): string => {
    const units = ['B', 'KB', 'MB', 'GB']
    let size = bytes
    let unitIndex = 0

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024
      unitIndex++
    }

    return `${size.toFixed(1)} ${units[unitIndex]}`
  }

  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((item) => (
        <Dialog key={item.id}>
          <DialogTrigger asChild>
            <Card className="group relative cursor-pointer overflow-hidden">
              <CardContent className="aspect-square p-0">
                {/* Checkbox */}
                <div className="absolute top-2 left-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
                  <Input
                    type="checkbox"
                    className="size-4 rounded-sm border-white bg-black/20"
                    onClick={(e) => e.stopPropagation()}
                  />
                </div>

                {/* Preview */}
                <div className="relative size-full">
                  <img src={item.url} alt={item.name} className="size-full object-cover" />

                  {/* Eye Icon on Hover */}
                  <div className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 transition-all duration-200 group-hover:opacity-100">
                    <Lucide.Eye className="size-8 scale-50 text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100" />
                  </div>
                </div>

                {/* File Info */}
                <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 p-2">
                  <div className="flex flex-col">
                    <span className="text-sm text-white">{item.name}</span>
                    <span className="text-white/80 text-xs">{formatFileSize(item.size)}</span>
                  </div>

                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-white hover:bg-white/20"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Lucide.MoreVertical className="size-4" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent align="end" className="w-44 p-2">
                      <div className="space-y-1">
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Lucide.PenSquare className="mr-1 size-4" />
                          Rename
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Lucide.Copy className="mr-1 size-4" />
                          Copy Link
                        </Button>
                        <Button variant="ghost" size="sm" className="w-full justify-start">
                          <Lucide.Download className="mr-1 size-4" />
                          Download
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          className="w-full justify-start text-destructive"
                        >
                          <Lucide.Trash2 className="mr-1 size-4" />
                          Delete
                        </Button>
                      </div>
                    </PopoverContent>
                  </Popover>
                </div>
              </CardContent>
            </Card>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Preview</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <img
                src={item.url}
                alt={item.name}
                className="aspect-square w-full rounded-lg object-cover"
              />
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Name:</span>
                  <span>{item.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Size:</span>
                  <span>{formatFileSize(item.size)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Type:</span>
                  <span>{item.type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Modified:</span>
                  <span>{item.modified}</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex border-t pt-4">
                <div className="flex gap-2">
                  <Button variant="secondary" size="sm">
                    <Lucide.Download className="mr-1 size-4" />
                    Download
                  </Button>
                  <Button variant="secondary" size="sm">
                    <Lucide.Copy className="mr-1 size-4" />
                    Copy Link
                  </Button>
                </div>
                <div className="ml-auto">
                  <Button variant="destructive" size="sm">
                    <Lucide.Trash2 className="mr-1 size-4" />
                    Delete
                  </Button>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      ))}
    </div>
  )
}
