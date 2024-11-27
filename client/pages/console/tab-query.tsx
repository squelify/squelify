import * as Lucide from 'lucide-react'
import { Accordion, AccordionTrigger } from '#/components/base-ui/accordion'
import { AccordionContent, AccordionItem } from '#/components/base-ui/accordion'
import { TabsContent } from '#/components/base-ui/tabs'

export default function TabQuery() {
  return (
    <TabsContent value="query">
      <Accordion type="single" collapsible className="-mt-2 size-full" defaultValue="saved-queries">
        <AccordionItem value="saved-queries">
          <AccordionTrigger className="px-4 py-3 text-xs hover:bg-accent hover:no-underline">
            Saved Queries
          </AccordionTrigger>
          <AccordionContent className="size-full p-2">
            <div className="-mt-1 space-y-1">
              <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
                <div className="flex items-center gap-2">
                  <Lucide.SquareTerminal className="size-3.5 text-muted-foreground" />
                  <span>Create Users Table</span>
                </div>
                <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                  2m ago
                </span>
              </div>
              <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
                <div className="flex items-center gap-2">
                  <Lucide.SquareTerminal className="size-3.5 text-muted-foreground" />
                  <span>Alter Users Table</span>
                </div>
                <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                  2w ago
                </span>
              </div>
              <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
                <div className="flex items-center gap-2">
                  <Lucide.SquareTerminal className="size-3.5 text-muted-foreground" />
                  <span>Count Users Table</span>
                </div>
                <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                  2m ago
                </span>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="history">
          <AccordionTrigger className="px-4 py-3 text-xs hover:bg-accent hover:no-underline">
            Query History
          </AccordionTrigger>
          <AccordionContent className="size-full p-2">
            <div className="-mt-1 space-y-1">
              <div className="group select-none rounded px-2.5 py-1.5 hover:bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lucide.Clock className="size-3.5 text-muted-foreground" />
                    <code className="font-mono text-[11px] text-muted-foreground">
                      SELECT * FROM users;
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60 text-xs">12 rows</span>
                    <span className="text-muted-foreground/60 text-xs">2m ago</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground/60 text-xs">
                  <Lucide.Timer className="h-3 w-3" />
                  <span>0.24s</span>
                </div>
              </div>

              <div className="group select-none rounded px-2.5 py-1.5 hover:bg-background">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Lucide.Clock className="size-3.5 text-muted-foreground" />
                    <code className="font-mono text-[11px] text-muted-foreground">
                      SELECT * FROM posts WHERE user_id = 1;
                    </code>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-muted-foreground/60 text-xs">45 rows</span>
                    <span className="text-muted-foreground/60 text-xs">5m ago</span>
                  </div>
                </div>
                <div className="mt-1 flex items-center gap-2 text-muted-foreground/60 text-xs">
                  <Lucide.Timer className="h-3 w-3" />
                  <span>0.35s</span>
                </div>
              </div>
            </div>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </TabsContent>
  )
}
