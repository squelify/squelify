import * as Lucide from 'lucide-react'
import { TabsContent } from '#/components/base-ui/tabs'

export default function TabTable() {
  return (
    <TabsContent value="table" className="m-0 p-2">
      <div className="space-y-1">
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
