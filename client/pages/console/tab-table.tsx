import * as Lucide from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { Input } from '#/components/base-ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '#/components/base-ui/select'
import { TabsContent } from '#/components/base-ui/tabs'
import { TooltipContent, TooltipProvider } from '#/components/base-ui/tooltip'
import { Tooltip, TooltipTrigger } from '#/components/base-ui/tooltip'

export default function TabTable() {
  const [inputValue, setInputValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>()

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
    [debouncedValue]
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
            <TooltipContent side="left" sideOffset={4}>
              <p>New Table</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <div className="-mt-12 flex h-full flex-col justify-between pt-12">
        <div className="h-full space-y-1 p-2">
          {filteredTables.map((item) => (
            <div
              key={item.id}
              className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground"
            >
              <div className="flex items-center gap-2">
                <Lucide.Table2 className="size-3.5" />
                <span>{item.name}</span>
              </div>
              <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                {item.rows} rows
              </span>
            </div>
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
