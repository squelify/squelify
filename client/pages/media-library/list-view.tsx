import * as Lucide from 'lucide-react'
import { AspectRatio, Button, Input, Skeleton } from '#/components/base-ui'
import { Dialog, DialogContent, DialogTrigger } from '#/components/base-ui'
import { DialogHeader, DialogTitle } from '#/components/base-ui'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/base-ui'
import { Table, TableBody, TableCell, TableRow } from '#/components/base-ui'
import { TableHead, TableHeader } from '#/components/base-ui'
import { type MediaItem } from '#/utils/dummy'

interface ListViewProps {
  items: MediaItem[]
}

export const ListViewSkeleton = () => (
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
        <TableHead className="w-[80px] text-center">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((val) => (
        <TableRow key={`skeleton-${val}`}>
          <TableCell className="pl-3">
            <Skeleton className="size-4" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Skeleton className="size-10 rounded-lg" />
              </div>
              <Skeleton className="h-4 w-[150px]" />
            </div>
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[80px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[60px]" />
          </TableCell>
          <TableCell>
            <Skeleton className="h-4 w-[100px]" />
          </TableCell>
          <TableCell>
            <div className="flex items-center justify-center">
              <Skeleton className="size-8 rounded-md" />
            </div>
          </TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
)

export default function ListView({ items }: ListViewProps) {
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
          <TableHead className="w-[80px] text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <Dialog key={item.id}>
            <TableRow className="group">
              <TableCell className="pl-3">
                <Input type="checkbox" className="size-4" onClick={(e) => e.stopPropagation()} />
              </TableCell>
              <TableCell>
                <DialogTrigger asChild>
                  <div className="flex cursor-pointer items-center gap-2">
                    <div className="relative">
                      <img
                        src={item.url}
                        alt={item.name}
                        className="size-10 rounded-lg border object-cover"
                      />
                      <div className="absolute inset-0 flex items-center justify-center rounded-lg bg-black/40 opacity-0 transition-all duration-200 group-hover:opacity-100">
                        <Lucide.Eye className="size-4 scale-50 text-white opacity-0 transition-all duration-200 group-hover:scale-100 group-hover:opacity-100" />
                      </div>
                    </div>
                    <span>{item.name}</span>
                  </div>
                </DialogTrigger>
              </TableCell>
              <TableCell>{item.type}</TableCell>
              <TableCell>{formatFileSize(item.size)}</TableCell>
              <TableCell>{item.modified}</TableCell>
              <TableCell>
                <div className="flex items-center justify-center">
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="hover:bg-muted"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Lucide.MoreHorizontal className="size-4" />
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
              </TableCell>
            </TableRow>
            <DialogContent autoFocus={false}>
              <DialogHeader>
                <DialogTitle>Preview</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <AspectRatio
                  ratio={item.type === 'application/pdf' ? 3 / 4 : 16 / 9}
                  className="rounded-lg border border-muted-foreground/20 bg-muted"
                >
                  <img
                    src={item.url}
                    alt={item.name}
                    className="size-full rounded-md object-cover"
                  />
                </AspectRatio>
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
      </TableBody>
    </Table>
  )
}
