import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'
import { Dialog, DialogContent, DialogTrigger } from '#/components/base-ui/dialog'
import { DialogHeader, DialogTitle } from '#/components/base-ui/dialog'
import { Input } from '#/components/base-ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/base-ui/popover'
import { Skeleton } from '#/components/base-ui/skeleton'
import { Table, TableBody, TableCell, TableRow } from '#/components/base-ui/table'
import { TableHead, TableHeader } from '#/components/base-ui/table'
import { type MediaItem } from './dummy'

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
        <TableHead className="w-[120px]">Actions</TableHead>
      </TableRow>
    </TableHeader>
    <TableBody>
      {Array.from({ length: 5 }).map((val) => (
        <TableRow key={`skeleton-${val}`}>
          <TableCell className="pl-3">
            <Input type="checkbox" className="size-4" />
          </TableCell>
          <TableCell>
            <div className="flex items-center gap-2">
              <Skeleton className="size-10 rounded-lg" />
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
            <div className="flex items-center gap-1">
              <Skeleton className="size-8 rounded-md" />
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
          <TableHead className="w-[120px] text-center">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((item) => (
          <TableRow key={item.id}>
            <TableCell className="pl-3">
              <Input type="checkbox" className="size-4" />
            </TableCell>
            <TableCell>
              <div className="flex items-center gap-2">
                <img
                  src={item.url}
                  alt={item.name}
                  className="size-10 rounded-lg border object-cover"
                />
                <span>{item.name}</span>
              </div>
            </TableCell>
            <TableCell>{item.type}</TableCell>
            <TableCell>{formatFileSize(item.size)}</TableCell>
            <TableCell>{item.modified}</TableCell>
            <TableCell>
              <div className="flex items-center justify-center gap-1">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <Lucide.Eye className="size-4" />
                    </Button>
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
                    </div>
                  </DialogContent>
                </Dialog>

                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
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
        ))}
      </TableBody>
    </Table>
  )
}
