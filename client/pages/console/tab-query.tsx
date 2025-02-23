import * as Lucide from 'lucide-react'
import { useMemo, useRef, useState } from 'react'
import { Accordion, AccordionTrigger } from '#/components/base-ui'
import { AccordionContent, AccordionItem } from '#/components/base-ui'
import { Button, Input, TabsContent } from '#/components/base-ui'
import { TooltipContent, TooltipProvider } from '#/components/base-ui'
import { Tooltip, TooltipTrigger } from '#/components/base-ui'
import { clx } from '#/utils/helper'

export default function TabQuery() {
  const [inputValue, setInputValue] = useState('')
  const [debouncedValue, setDebouncedValue] = useState('')
  const timeoutRef = useRef<ReturnType<typeof setTimeout>>(null)

  const savedQueriesItem = [
    {
      id: 1,
      name: 'Create Users Table',
      timestamp: '2m ago',
    },
    {
      id: 2,
      name: 'Alter Users Table',
      timestamp: '2m ago',
    },
    {
      id: 3,
      name: 'Count Users Table',
      timestamp: '2m ago',
    },
  ]

  const queryHistoryItem = [
    {
      id: 1,
      query: 'SELECT * FROM users;',
      timestamp: '2m ago',
      duration: '0.24s',
    },
    {
      id: 2,
      query: 'SELECT * FROM posts WHERE user_id = 1;',
      timestamp: '5m ago',
      duration: '0.35s',
    },
    {
      id: 3,
      query: 'SELECT * FROM posts WHERE user_id = 1;',
      timestamp: '5m ago',
      duration: '0.35s',
    },
    {
      id: 4,
      query: 'SELECT * FROM posts WHERE user_id = 1;',
      timestamp: '5m ago',
      duration: '0.35s',
    },
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

  const filteredSavedQueries = useMemo(
    () =>
      savedQueriesItem.filter((item) =>
        item.name.toLowerCase().includes(debouncedValue.toLowerCase()),
      ),
    [debouncedValue],
  )

  const filteredQueryHistory = useMemo(
    () =>
      queryHistoryItem.filter((item) =>
        item.query.toLowerCase().includes(debouncedValue.toLowerCase()),
      ),
    [debouncedValue],
  )

  return (
    <TabsContent value="query" className="-mt-10 mx-0 h-full pt-10">
      <div className="flex h-12 w-full flex-row items-center justify-between gap-2 border-b p-3">
        <div className="flex-1">
          <Input
            onChange={handleInputChange}
            className="h-8 w-full bg-background text-xs shadow-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary/50"
            placeholder="Search query..."
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
              <p>New Query</p>
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
      <Accordion type="multiple" className="size-full" defaultValue={['saved-queries', 'history']}>
        <AccordionItem value="saved-queries">
          <AccordionTrigger className="px-4 py-3 text-xs hover:bg-accent hover:no-underline">
            Saved Queries
          </AccordionTrigger>
          <AccordionContent className="size-full p-2">
            <div className="-mt-1 space-y-1">
              {filteredSavedQueries.map((item) => (
                <div
                  key={item.id}
                  className={clx(
                    'group flex select-none items-center justify-between rounded-sm px-2.5 py-1.5 text-sm',
                    'text-muted-foreground hover:bg-background hover:text-foreground',
                  )}
                >
                  <div className="flex items-center gap-2">
                    <Lucide.SquareTerminal className="size-3.5 text-muted-foreground" />
                    <span>{item.name}</span>
                  </div>
                  <span className="invisible min-w-12 font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                    {item.timestamp}
                  </span>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="history">
          <AccordionTrigger className="px-4 py-3 text-xs hover:bg-accent hover:no-underline">
            Query History
          </AccordionTrigger>
          <AccordionContent className="size-full p-2">
            <div className="-mt-1 space-y-1">
              {filteredQueryHistory.map((item) => (
                <div
                  key={item.id}
                  className="group select-none rounded-sm px-2.5 py-1.5 hover:bg-background"
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {/* <Lucide.Clock className="size-3.5 text-muted-foreground" /> */}
                      <code className="font-mono text-[11px] text-muted-foreground">
                        {item.query}
                      </code>
                    </div>
                    <div className="invisible flex min-w-12 items-center gap-2 group-hover:visible">
                      <span className="text-muted-foreground/60 text-xs">{item.timestamp}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TabsContent>
  )
}
