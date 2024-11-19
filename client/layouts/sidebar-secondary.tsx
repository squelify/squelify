import * as Lucide from 'lucide-react'
import { Button } from '#/components/base-ui/button'
import { SidebarHeader, SidebarInput } from '#/components/base-ui/sidebar'
import { SidebarGroup, SidebarGroupContent } from '#/components/base-ui/sidebar'
import { Sidebar, SidebarContent } from '#/components/base-ui/sidebar'
import { Link } from '#/components/link'

export default function SecondarySidebar() {
  return (
    <Sidebar collapsible="none" className="h-svh w-64 border-r border-r-border bg-sidebar">
      <SidebarHeader className="gap-2.5 border-b p-3">
        <div className="flex w-full items-center justify-between">
          <span className="font-medium text-foreground text-sm">Collections</span>
        </div>
        <SidebarInput placeholder="Type to search..." />
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <Button variant="ghost" size="default" className="w-full justify-start" asChild>
              <Link href="/content/collections?collectionId=col_1234567890&filter=&sort=-created">
                <Lucide.Table2 className="size-3" strokeWidth={1.8} />
                <span>users</span>
              </Link>
            </Button>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  )
}
