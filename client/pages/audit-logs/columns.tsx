import { ColumnDef } from '@tanstack/react-table'
import * as Lucide from 'lucide-react'
import type { AuditLog } from '~/database/schemas/audit_log'
import { Badge } from '#/components/base-ui/badge'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuItem, DropdownMenuLabel } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuContent } from '#/components/base-ui/dropdown-menu'

export const filterableColumns = [
  { id: 'action', title: 'Action' },
  { id: 'entity', title: 'Entity' },
  { id: 'userId', title: 'Actor' },
  { id: 'organizationId', title: 'Organization' },
] as const

export const visibleColumns = [
  { id: 'createdAt', title: 'Date' },
  { id: 'action', title: 'Action' },
  { id: 'entity', title: 'Entity' },
  { id: 'userId', title: 'Actor' },
  { id: 'ipAddress', title: 'IP Address' },
] as const

function getActionVariant(
  action: string
): 'default' | 'destructive' | 'outline' | 'secondary' | 'ghost' | 'link' {
  switch (action) {
    case 'create':
      return 'default'
    case 'delete':
      return 'destructive'
    case 'update':
      return 'secondary'
    default:
      return 'outline'
  }
}

export const columns: ColumnDef<AuditLog>[] = [
  {
    accessorKey: 'createdAt',
    header: ({ column }) => (
      <div className="w-[180px]">
        <Button
          variant="ghost"
          onClick={() => column.toggleSorting(column.getIsSorted() === 'asc')}
        >
          Date
          <Lucide.ArrowUpDown className="ml-2 h-4 w-4" />
        </Button>
      </div>
    ),
    cell: ({ row }) => {
      const timestamp = row.getValue('createdAt') as number
      return <div className="w-[180px]">{new Date(timestamp * 1000).toLocaleString()}</div>
    },
  },
  {
    accessorKey: 'action',
    header: 'Action',
    cell: ({ row }) => {
      const variant = getActionVariant(row.getValue('action'))
      return (
        <div className="w-[100px]">
          <Badge variant={variant === 'link' || variant === 'ghost' ? 'default' : variant}>
            {row.getValue('action')}
          </Badge>
        </div>
      )
    },
  },
  {
    accessorKey: 'entity',
    header: 'Entity',
    cell: ({ row }) => <div className="w-[120px] capitalize">{row.getValue('entity')}</div>,
  },
  {
    accessorKey: 'entityId',
    header: 'Entity ID',
    cell: ({ row }) => (
      <div className="w-[200px] font-mono text-sm">{row.getValue('entityId')}</div>
    ),
  },
  {
    accessorKey: 'userId',
    header: 'Actor',
    cell: ({ row }) => <div className="w-[200px] font-mono text-sm">{row.getValue('userId')}</div>,
  },
  {
    accessorKey: 'ipAddress',
    header: 'IP Address',
    cell: ({ row }) => (
      <div className="w-[140px] font-mono text-sm">{row.getValue('ipAddress')}</div>
    ),
  },
  {
    id: 'actions',
    cell: ({ row }) => (
      <div className="w-[80px] text-right">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" className="h-8 w-8 p-0">
              <Lucide.MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>Actions</DropdownMenuLabel>
            <DropdownMenuItem>View Details</DropdownMenuItem>
            <DropdownMenuItem onClick={() => navigator.clipboard.writeText(row.original.id)}>
              Copy ID
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    ),
  },
]
