import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'
import { Input } from '#/components/base-ui/input'
import { TabsContent } from '#/components/base-ui/tabs'

export default function TabTable() {
  return (
    <TabsContent value="table" className="m-0">
      <div
        id="sidebar-hader"
        className="flex w-full flex-row items-center justify-between gap-2 border-b p-3"
      >
        <div className="flex-1">
          <Input
            className="h-8 w-full bg-background text-xs shadow-none focus:ring-0 focus-visible:ring-1 focus-visible:ring-sidebar-ring"
            placeholder="Search table..."
          />
        </div>
        <Button variant="outline" size="icon" className="size-8 text-muted-foreground shadow-none">
          <Lucide.CopyPlus className="size-3.5 text-muted-foreground" strokeWidth={1.8} />
        </Button>
      </div>
      <div className="space-y-1 p-2">
        <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
          <div className="flex items-center gap-2">
            <Lucide.Table2 className="size-3.5" />
            <span>users</span>
          </div>
          <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
            12 rows
          </span>
        </div>
        <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
          <div className="flex items-center gap-2">
            <Lucide.Table2 className="size-3.5" />
            <span>posts</span>
          </div>
          <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
            45 rows
          </span>
        </div>
        <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
          <div className="flex items-center gap-2">
            <Lucide.Table2 className="size-3.5" />
            <span>comments</span>
          </div>
          <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
            89 rows
          </span>
        </div>
      </div>
    </TabsContent>
  )
}
