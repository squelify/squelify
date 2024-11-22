import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'
import { Card, CardContent } from '#/components/base-ui/card'
import { Dialog, DialogContent, DialogTrigger } from '#/components/base-ui/dialog'
import { DialogHeader, DialogTitle } from '#/components/base-ui/dialog'
import { Input } from '#/components/base-ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/base-ui/popover'
import { Skeleton } from '#/components/base-ui/skeleton'
import { Tooltip, TooltipContent, TooltipTrigger } from '#/components/base-ui/tooltip'

interface GridViewProps {
  items: string[]
}

export default function GridView({ items }: GridViewProps) {
  return (
    <div className="grid grid-cols-2 gap-4 p-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
      {items.map((key) => (
        <Card key={key} className="group relative overflow-hidden">
          <CardContent className="aspect-square p-0">
            {/* Checkbox */}
            <div className="absolute top-2 left-2 z-10 opacity-0 transition-opacity group-hover:opacity-100">
              <Input type="checkbox" className="h-4 w-4 rounded-sm border-white bg-black/20" />
            </div>

            {/* Preview */}
            <div className="relative size-full">
              <Skeleton className="size-full bg-muted" />

              {/* Quick Actions */}
              <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Lucide.Eye className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Preview</DialogTitle>
                    </DialogHeader>
                    <div className="aspect-square w-full rounded-lg border bg-muted" />
                  </DialogContent>
                </Dialog>

                <Tooltip>
                  <TooltipTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Lucide.Download className="h-4 w-4" />
                    </Button>
                  </TooltipTrigger>
                  <TooltipContent>Download</TooltipContent>
                </Tooltip>

                <Dialog>
                  <DialogTrigger asChild>
                    <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                      <Lucide.Info className="h-4 w-4" />
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>File Details</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4">
                      <div className="aspect-square w-full rounded-lg border bg-muted" />
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Name:</span>
                          <span>filename.jpg</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Size:</span>
                          <span>2.4 MB</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Type:</span>
                          <span>Image/JPEG</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-muted-foreground">Uploaded:</span>
                          <span>2 days ago</span>
                        </div>
                      </div>
                    </div>
                  </DialogContent>
                </Dialog>
              </div>
            </div>

            {/* File Info */}
            <div className="absolute inset-x-0 bottom-0 flex items-center justify-between bg-gradient-to-t from-black/60 p-2">
              <div className="flex flex-col">
                <span className="text-sm text-white">filename.jpg</span>
                <span className="text-white/80 text-xs">2.4 MB</span>
              </div>

              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                    <Lucide.MoreVertical className="h-4 w-4" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent align="end" className="w-48">
                  <div className="space-y-1">
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Lucide.PenSquare className="mr-2 h-4 w-4" />
                      Rename
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Lucide.Copy className="mr-2 h-4 w-4" />
                      Copy Link
                    </Button>
                    <Button variant="ghost" size="sm" className="w-full justify-start">
                      <Lucide.Download className="mr-2 h-4 w-4" />
                      Download
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="w-full justify-start text-destructive"
                    >
                      <Lucide.Trash2 className="mr-2 h-4 w-4" />
                      Delete
                    </Button>
                  </div>
                </PopoverContent>
              </Popover>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
