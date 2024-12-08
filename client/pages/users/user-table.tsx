import * as Lucide from 'lucide-react'
import type { User } from '~/database/schemas/user'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuItem } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuSeparator } from '#/components/base-ui/dropdown-menu'
import { Input } from '#/components/base-ui/input'
import { Skeleton } from '#/components/base-ui/skeleton'
import { Table, TableBody, TableCell, TableRow } from '#/components/base-ui/table'
import { TableHead, TableHeader } from '#/components/base-ui/table'
import { clx } from '#/utils/helper'

interface UserTableProps {
  users?: User[]
  isLoading: boolean
}

export function UserTable({ users, isLoading }: UserTableProps) {
  return (
    <div className="overflow-x-auto">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[40px] pl-3">
              <Input type="checkbox" className="size-4" />
            </TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="w-[120px]">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {isLoading ? (
            ['skeleton-1', 'skeleton-2', 'skeleton-3', 'skeleton-4', 'skeleton-5'].map((key) => (
              <TableRow key={key}>
                <TableCell className="pl-3">
                  <Input type="checkbox" className="size-4" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[150px] bg-muted" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[200px] bg-muted" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[100px] bg-muted" />
                </TableCell>
                <TableCell>
                  <Skeleton className="h-4 w-[80px] bg-muted" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <Lucide.Pencil className="size-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <Lucide.MoreHorizontal className="size-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : users && users.length > 0 ? (
            users.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="pl-3">
                  <Input type="checkbox" className="size-4" />
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2">
                    <div className="size-8 rounded-full bg-muted">
                      {user.avatarUrl ? (
                        <img
                          src={user.avatarUrl}
                          alt={user.firstName}
                          className="size-full rounded-full object-cover"
                        />
                      ) : (
                        <div className="flex size-full items-center justify-center rounded-full bg-primary/10">
                          <Lucide.User className="size-4 text-primary" />
                        </div>
                      )}
                    </div>
                    <div>
                      <div className="font-medium">
                        {user.firstName} {user.lastName}
                      </div>
                      <div className="text-muted-foreground text-sm">{user.username}</div>
                    </div>
                  </div>
                </TableCell>
                <TableCell>{user.username}</TableCell>
                <TableCell>
                  <span className="inline-flex items-center rounded-md bg-blue-50 px-2 py-1 font-medium text-blue-700 text-xs ring-1 ring-blue-700/10 ring-inset">
                    User
                  </span>
                </TableCell>
                <TableCell>
                  <span
                    className={clx(
                      'inline-flex items-center rounded-full px-2 py-1 font-medium text-xs',
                      user.isActive ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'
                    )}
                  >
                    {user.isActive ? 'Active' : 'Inactive'}
                  </span>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-1">
                    <Button variant="ghost" size="icon" className="hover:bg-muted">
                      <Lucide.Pencil className="size-4" />
                    </Button>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="hover:bg-muted">
                          <Lucide.MoreHorizontal className="size-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem>
                          <Lucide.Mail className="mr-2 size-4" />
                          Send Email
                        </DropdownMenuItem>
                        <DropdownMenuItem>
                          <Lucide.UserX className="mr-2 size-4" />
                          Deactivate
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="text-destructive">
                          <Lucide.Trash2 className="mr-2 size-4" />
                          Delete
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </TableCell>
              </TableRow>
            ))
          ) : (
            <TableRow>
              <TableCell colSpan={6} className="h-24 text-center">
                <Lucide.Users className="mx-auto mb-2 size-8 text-muted-foreground" />
                <span className="text-muted-foreground text-sm">No results.</span>
              </TableCell>
            </TableRow>
          )}
        </TableBody>
      </Table>
    </div>
  )
}
