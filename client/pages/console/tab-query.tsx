import * as Lucide from 'lucide-react'
import { Accordion, AccordionTrigger } from '#/components/base-ui/accordion'
import { AccordionContent, AccordionItem } from '#/components/base-ui/accordion'
import { TabsContent } from '#/components/base-ui/tabs'
import { clx } from '#/utils/helper'

export default function TabQuery() {
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

  return (
    <TabsContent value="query">
      <Accordion type="multiple" className="-mt-2 size-full">
        <AccordionItem value="saved-queries">
          <AccordionTrigger className="px-4 py-3 text-xs hover:bg-accent hover:no-underline">
            Saved Queries
          </AccordionTrigger>
          <AccordionContent className="size-full p-2">
            <div className="-mt-1 space-y-1">
              {savedQueriesItem.map((item) => (
                <div
                  key={item.id}
                  className={clx(
                    'group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-sm',
                    'text-muted-foreground hover:bg-background hover:text-foreground'
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
              {queryHistoryItem.map((item) => (
                <div
                  key={item.id}
                  className="group select-none rounded px-2.5 py-1.5 hover:bg-background"
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
