import type { LucideIcon } from 'lucide-react'
import * as Lucide from 'lucide-react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation } from 'react-router'
import { ResizablePanel, ResizablePanelGroup } from '#/components/base-ui/resizable'
import { ResizableHandle } from '#/components/base-ui/resizable'
import { Tabs, TabsList, TabsTrigger } from '#/components/base-ui/tabs'
import { Link } from '#/components/link'
import ErrorBoundaryFallback from '#/pages/error/boundary-fallback'
import { clx } from '#/utils/helper'

import TabQuery from './tab-query'
import TabTable from './tab-table'

interface ConsoleTab {
  label: string
  value: string
  href: string
  icon: LucideIcon
}

const CONSOLE_TABS: ConsoleTab[] = [
  { label: 'Table', value: 'table', href: '/console/table', icon: Lucide.Table },
  { label: 'Query', value: 'query', href: '/console/query', icon: Lucide.Clock },
]

export default function SQLConsoleLayout() {
  const location = useLocation()
  const activeSection = location.pathname.split('/')[2] || 'table'

  return (
    <ErrorBoundary FallbackComponent={ErrorBoundaryFallback}>
      <ResizablePanelGroup
        direction="horizontal"
        autoSaveId="sql-console"
        className="flex size-full flex-1 flex-col bg-background"
      >
        <ResizablePanel defaultSize={14} minSize={14} maxSize={20} className="bg-sidebar/80">
          <Tabs value={activeSection} defaultValue={activeSection} className="h-full">
            <TabsList className="grid h-10 w-full grid-cols-2 gap-1 rounded-none border-b bg-sidebar/40 px-2 py-0">
              {CONSOLE_TABS.map((tab) => (
                <TabsTrigger key={tab.value} value={tab.value} asChild>
                  <Link
                    href={tab.href}
                    className={clx(
                      'flex h-7 items-center justify-center gap-1.5 px-3 text-xs hover:bg-background',
                      'data-[state=active]:bg-gray-200/60 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-700/60'
                    )}
                  >
                    <tab.icon className="size-3.5" strokeWidth={1.6} />
                    <span>{tab.label}</span>
                  </Link>
                </TabsTrigger>
              ))}
            </TabsList>
            <TabTable />
            <TabQuery />
          </Tabs>
        </ResizablePanel>
        <ResizableHandle withHandle />
        <Outlet />
      </ResizablePanelGroup>
    </ErrorBoundary>
  )
}
