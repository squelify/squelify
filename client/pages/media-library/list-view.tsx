import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'
import { Input } from '#/components/base-ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '#/components/base-ui/popover'
import { Skeleton } from '#/components/base-ui/skeleton'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '#/components/base-ui/table'

interface ListViewProps {
  items: string[]
}

export default function ListView({ items }: ListViewProps) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead className="w-[40px] pl-3">
            <Input type="checkbox" className="h-4 w-4" />
          </TableHead>
          <TableHead>Name</TableHead>
          <TableHead>Type</TableHead>
          <TableHead>Size</TableHead>
          <TableHead>Modified</TableHead>
          <TableHead className="w-[100px]">Actions</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {items.map((key) => (
          <TableRow key={key}>
            <TableCell className="pl-3">
              <Input type="checkbox" className="h-4 w-4" />
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
                  <Lucide.Download className="h-4 w-4" />
                </Button>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <Lucide.MoreHorizontal className="h-4 w-4" />
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
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
