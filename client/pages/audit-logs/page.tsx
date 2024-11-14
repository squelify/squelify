import { flexRender, getCoreRowModel, useReactTable } from '@tanstack/react-table'
import { ColumnFiltersState, SortingState, VisibilityState } from '@tanstack/react-table'
import { getFilteredRowModel, getSortedRowModel } from '@tanstack/react-table'
import { getPaginationRowModel } from '@tanstack/react-table'
import * as Lucide from 'lucide-react'
import { useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuCheckboxItem, DropdownMenuContent } from '#/components/base-ui/dropdown-menu'
import { Input } from '#/components/base-ui/input'
import { Table, TableBody, TableRow } from '#/components/base-ui/table'
import { TableCell, TableHead, TableHeader } from '#/components/base-ui/table'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

import type { AuditLog } from '~/database/schemas/audit_log'
import { columns, visibleColumns } from './columns'

export default function Component() {
  useSEOMeta('Audit Logs')

  const [sorting, setSorting] = useState<SortingState>([])
  const [columnFilters, setColumnFilters] = useState<ColumnFiltersState>([])
  const [columnVisibility, setColumnVisibility] = useState<VisibilityState>({})

  const data: AuditLog[] = [
    {
      id: 'audit_01',
      userId: 'user_01',
      organizationId: 'org_01',
      action: 'login',
      entity: 'user',
      entityId: 'user_01',
      oldValues: '{}',
      newValues: '{}',
      metadata: '{}',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      retention: 7776000,
      createdAt: Math.floor(Date.now() / 1000),
    },
    {
      id: 'audit_02',
      userId: 'user_01',
      organizationId: 'org_01',
      action: 'login',
      entity: 'user',
      entityId: 'user_01',
      oldValues: '{}',
      newValues: '{}',
      metadata: '{}',
      ipAddress: '192.168.1.1',
      userAgent: 'Mozilla/5.0...',
      retention: 7776000,
      createdAt: Math.floor(Date.now() / 1000),
    },
  ]

  const table = useReactTable({
    data,
    columns,
    getCoreRowModel: getCoreRowModel(),
    getPaginationRowModel: getPaginationRowModel(),
    getSortedRowModel: getSortedRowModel(),
    getFilteredRowModel: getFilteredRowModel(),
    onSortingChange: setSorting,
    onColumnFiltersChange: setColumnFilters,
    onColumnVisibilityChange: setColumnVisibility,
    state: {
      sorting,
      columnFilters,
      columnVisibility,
    },
  })

  return (
    <div className="container mx-auto w-full space-y-8 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div className="space-y-1">
          <h1 className="font-semibold text-2xl tracking-tight">Audit Logs</h1>
          <p className="text-muted-foreground text-sm">
            Track all activities and changes across your organization
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm">
            <Lucide.Download className="mr-2 h-4 w-4" />
            Export
          </Button>
        </div>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <Input
            placeholder="Filter by entity..."
            value={(table.getColumn('entity')?.getFilterValue() as string) ?? ''}
            onChange={(event) => table.getColumn('entity')?.setFilterValue(event.target.value)}
            className="max-w-sm"
          />

          <div className="flex items-center gap-2">
            <Button variant="outline">
              <Lucide.RotateCw className="h-4 w-4" />
              <span className="sr-only">Refresh</span>
            </Button>

            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="outline">
                  Columns
                  <Lucide.ChevronDown className="ml-2 h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                {visibleColumns.map((column) => (
                  <DropdownMenuCheckboxItem
                    key={column.id}
                    className="capitalize"
                    checked={table.getColumn(column.id)?.getIsVisible()}
                    onCheckedChange={(value) =>
                      table.getColumn(column.id)?.toggleVisibility(!!value)
                    }
                  >
                    {column.title}
                  </DropdownMenuCheckboxItem>
                ))}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>

        <div className="rounded-md border">
          <Table>
            <TableHeader className="bg-muted/50">
              {table.getHeaderGroups().map((headerGroup) => (
                <TableRow key={headerGroup.id}>
                  {headerGroup.headers.map((header) => (
                    <TableHead key={header.id}>
                      {header.isPlaceholder
                        ? null
                        : flexRender(header.column.columnDef.header, header.getContext())}
                    </TableHead>
                  ))}
                </TableRow>
              ))}
            </TableHeader>
            <TableBody>
              {table.getRowModel().rows?.length ? (
                table.getRowModel().rows.map((row) => (
                  <TableRow key={row.id} data-state={row.getIsSelected() && 'selected'}>
                    {row.getVisibleCells().map((cell) => (
                      <TableCell key={cell.id}>
                        {flexRender(cell.column.columnDef.cell, cell.getContext())}
                      </TableCell>
                    ))}
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={columns.length} className="h-24 text-center">
                    No results.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="flex items-center justify-end space-x-2 py-4">
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.previousPage()}
            disabled={!table.getCanPreviousPage()}
          >
            Previous
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={() => table.nextPage()}
            disabled={!table.getCanNextPage()}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

Component.displayName = 'AuditLogsPage'
