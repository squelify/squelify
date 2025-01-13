import type { LucideIcon } from 'lucide-react'
import * as Lucide from 'lucide-react'
import { Suspense } from 'react'
import { ErrorBoundary } from 'react-error-boundary'
import { Outlet, useLocation } from 'react-router'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/base-ui'
import { Tabs, TabsList, TabsTrigger } from '#/components/base-ui'
import { Link } from '#/components/base-ui'
import BoundaryError from '#/components/errors/boundary'
import PageLoader from '#/components/loaders/page-loader'
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
    <ErrorBoundary FallbackComponent={BoundaryError}>
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
        <Suspense fallback={<PageLoader />}>
          <Outlet />
        </Suspense>
      </ResizablePanelGroup>
    </ErrorBoundary>
  )
}
