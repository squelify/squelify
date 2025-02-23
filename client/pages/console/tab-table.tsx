import * as Lucide from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useMemo, useRef, useState } from 'react'
import { Button, Input, TabsContent } from '#/components/base-ui'
import { Select, SelectTrigger, SelectValue } from '#/components/base-ui'
import { SelectContent, SelectItem } from '#/components/base-ui'
import { DropdownMenu, DropdownMenuContent } from '#/components/base-ui'
import { DropdownMenuGroup, DropdownMenuPortal } from '#/components/base-ui'
import { DropdownMenuSub, DropdownMenuSubContent } from '#/components/base-ui'
import { DropdownMenuItem, DropdownMenuSeparator } from '#/components/base-ui'
import { DropdownMenuSubTrigger, DropdownMenuTrigger } from '#/components/base-ui'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '#/components/base-ui'
import { clx } from '#/utils/helper'

const MenuItemTable = () => {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="size-5 p-1.5">
          <Lucide.Ellipsis className="invisible size-3.5 group-hover:visible" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-44" align="center" side="bottom">
        <DropdownMenuGroup>
          <DropdownMenuItem className="flex gap-2 px-2 py-1.5 text-xs">
            <Lucide.FilePenLine className="size-4" strokeWidth={1.8} />
            <span>Edit Table</span>
          </DropdownMenuItem>
          <DropdownMenuItem className="flex gap-2 px-2 py-1.5 text-xs">
            <Lucide.Copy className="size-4" strokeWidth={1.8} />
            <span>Duplicate Table</span>
          </DropdownMenuItem>
          <DropdownMenuSub>
            <DropdownMenuSubTrigger className="flex gap-2 px-2 py-1.5 text-xs">
              <Lucide.Download className="size-4" strokeWidth={1.8} />
              <span>Export Data</span>
            </DropdownMenuSubTrigger>
            <DropdownMenuPortal>
              <DropdownMenuSubContent>
                <DropdownMenuItem className="text-xs">Export as CSV</DropdownMenuItem>
                <DropdownMenuItem className="text-xs">Export as SQL</DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuPortal>
          </DropdownMenuSub>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem className="flex gap-2 px-2 py-1.5 text-xs">
          <Lucide.Trash className="size-4" strokeWidth={1.8} />
          <span>Delete Table</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export default function TabTable() {
  const [collectionId, setCollectionId] = useQueryState('collectionId')

  const [inputValue, setInputValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const tableItems = [
    { id: 1, name: 'users', rows: 12 },
    { id: 2, name: 'posts', rows: 45 },
    { id: 3, name: 'comments', rows: 89 },
  ]

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value
    setInputValue(value)

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(value)
    }, 150)
  }

  const filteredTables = useMemo(
    () =>
      tableItems.filter((item) => item.name.toLowerCase().includes(debouncedValue.toLowerCase())),
    [debouncedValue],
  )

  return (
    <TabsContent value="table" className="-mt-10 mx-0 h-full pt-10">
      <div className="flex h-12 w-full flex-row items-center justify-between gap-2 border-b p-3">
        <div className="flex-1">
          <Input
            onChange={handleInputChange}
            className="h-8 w-full bg-background text-xs shadow-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary/50"
            placeholder="Search table..."
            value={inputValue}
          />
        </div>
        <TooltipProvider>
          <Tooltip delayDuration={100}>
            <TooltipTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="size-8 text-muted-foreground shadow-none"
              >
                <Lucide.CopyPlus className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
              </Button>
            </TooltipTrigger>
            <TooltipContent side="bottom" sideOffset={4}>
              <p>New Table</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="-mt-12 flex h-full flex-col justify-between pt-12">
        <div className="h-full space-y-1 p-2">
          {filteredTables.map((item) => (
            <Button
              size="sm"
              key={item.id}
              variant="ghost"
              className={clx(
                collectionId === item.id.toString()
                  ? 'bg-accent text-accent-foreground'
                  : 'text-muted-foreground',
                'group flex w-full justify-between rounded',
              )}
              onClick={() => setCollectionId(item.id.toString())}
            >
              <span className="flex items-center gap-2">
                <Lucide.Table2 className="size-3.5" />
                {item.name}
              </span>
              <MenuItemTable />
            </Button>
          ))}
          {filteredTables.length === 0 && (
            <div className="px-2.5 py-1.5 text-muted-foreground text-sm">No tables found</div>
          )}
        </div>
        <div className="flex w-full flex-row items-center justify-between gap-2 border-t p-2">
          <Select defaultValue="user-tables">
            <SelectTrigger className="w-full">
              <SelectValue placeholder="User Tables" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="user-tables">User Tables</SelectItem>
              <SelectItem value="system-tables">Sytem Tables</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </TabsContent>
  )
}
