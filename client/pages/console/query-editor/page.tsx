import { EditableGridCell, GridCellKind, GridColumn, Item } from '@glideapps/glide-data-grid'
import consola from 'consola'
import * as Lucide from 'lucide-react'
import { useCallback, useRef, useState } from 'react'
import { DropdownMenu, DropdownMenuContent } from '#/components/base-ui'
import { DropdownMenuShortcut } from '#/components/base-ui'
import { DropdownMenuItem, DropdownMenuTrigger } from '#/components/base-ui'
import { Button, Input, ScrollArea, Separator } from '#/components/base-ui'
import { ResizableHandle, ResizablePanel, ResizablePanelGroup } from '#/components/base-ui'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/base-ui'
import CodeEditor, { type EditorContextData, EditorRef } from '#/components/code-editor'
import DataGrid from '#/components/datagrid'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import { generateEmail, generateName, generatePhone, getRandomElement } from '#/utils/dummy'
import { clx } from '#/utils/helper'

type DummyItem = {
  name: string
  company: string
  email: string
  phone: string
}

const TOTAL_ROWS = 100

const COMPANIES = ['Acme Corp', 'TechStart', 'GlobalSys', 'DataFlow', 'CloudNet', 'SecureIT']

const generateDummyData = (count: number): DummyItem[] => {
  return Array.from({ length: count }, () => {
    const name = generateName()
    return {
      name,
      company: getRandomElement(COMPANIES),
      email: generateEmail(name),
      phone: generatePhone(),
    }
  })
}

const data = generateDummyData(TOTAL_ROWS)

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
const columns: GridColumn[] = [
  { id: 'name', title: 'Name', width: 150 },
  { id: 'company', title: 'Company', width: 150 },
  { id: 'email', title: 'Email', width: 150 },
  { id: 'phone', title: 'Phone', width: 150 },
]

export default function Page() {
  useSEOMeta('SQL Query Console')

  const editorRef = useRef<EditorRef>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [_query, setQuery] = useState('SELECT * FROM users;')

  const onCellEdited = useCallback((cell: Item, newValue: EditableGridCell) => {
    if (newValue.kind !== GridCellKind.Text) {
      // we only have text cells, might as well just die here.
      return
    }
    const indexes: (keyof DummyItem)[] = ['name', 'company', 'email', 'phone']
    const [col, row] = cell
    const key = indexes[col]
    data[row][key] = newValue.data
  }, [])

  const editorContextData: EditorContextData = {
    tables: ['users', 'posts'],
    columns: {
      users: ['id', 'name', 'email'],
      posts: ['id', 'title', 'content'],
    },
  }

  // Add query execution logic here
  const handleExecute = async (query: string) => {
    setIsExecuting(true)
    try {
      consola.log(query)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
    } finally {
      setQuery(query)
      setIsExecuting(false)
      requestAnimationFrame(() => {
        editorRef.current?.focus()
      })
    }
  }
  return (
    <ResizablePanel defaultSize={86} minSize={80} maxSize={86}>
      <ResizablePanelGroup autoSaveId="query-editor" direction="vertical">
        <ResizablePanel defaultSize={60}>
          <div className="flex size-full flex-col">
            <div className="flex h-10 items-center justify-between border-b bg-muted/20 px-2">
              <div className="flex items-center gap-2">
                <div className="flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group h-7 bg-primary/40 px-3 font-medium text-foreground/70 text-xs hover:bg-primary/70 hover:text-foreground active:scale-[0.98] active:bg-primary/80"
                        disabled={isExecuting}
                      >
                        <span>Run Query</span>
                        {isExecuting ? (
                          <Lucide.Loader2 className="-mr-1 size-3 animate-spin" />
                        ) : (
                          <Lucide.ChevronDown className="-mr-1 size-3" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52 p-1">
                      <DropdownMenuItem
                        className="cursor-pointer rounded-xs px-3 py-1.5 text-muted-foreground text-xs hover:bg-primary/20 hover:text-foreground focus:bg-primary/30"
                        onClick={() => editorRef.current?.execute()}
                      >
                        <span>Run current statement</span>
                        <DropdownMenuShortcut>⌘↵</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer rounded-xs px-3 py-1.5 text-muted-foreground text-xs hover:bg-primary/20 hover:text-foreground focus:bg-primary/30"
                        onClick={() => editorRef.current?.executeAll()}
                      >
                        <span>Run all statements</span>
                        <DropdownMenuShortcut>⇧⌘↵</DropdownMenuShortcut>
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>

                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 bg-secondary/80 px-4 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
                >
                  <Lucide.Save className="-ml-0.5 mr-1 size-3" />
                  <span>Save</span>
                </Button>

                <div className="p-0">
                  <Input
                    className="h-7 border-transparent bg-transparent px-2 font-medium text-muted-foreground text-xs shadow-none hover:border-input focus:ring-0 focus-visible:ring-0"
                    value="Untitled query"
                  />
                </div>
              </div>

              <Button
                size="sm"
                variant="ghost"
                className="h-7 bg-secondary/80 px-4 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
              >
                <Lucide.Download className="-ml-0.5 mr-1.5 size-3" />
                <span>Export</span>
              </Button>
            </div>
            <div className="flex-1 overflow-hidden">
              <CodeEditor
                ref={editorRef}
                language="sqlite"
                onChange={setQuery}
                contextData={editorContextData}
                placeholder="-- Write your query here"
                onExecute={handleExecute}
                isExecuting={isExecuting}
                autoFocus
              />
            </div>
          </div>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={40}>
          <Tabs defaultValue="results" className="h-full space-y-0">
            <div className="flex w-full gap-2 bg-muted/20 px-2">
              <TabsList className="h-9 w-full max-w-96 items-center justify-start gap-2.5 rounded-none rounded-t-md border-b bg-transparent p-0">
                <TabsTrigger
                  value="results"
                  className={clx(
                    'flex h-7 items-center gap-1.5 rounded-none rounded-t-sm border-transparent border-b-2 px-1 text-xs',
                    'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none'
                  )}
                >
                  <Lucide.Sheet className="size-3.5" />
                  Results
                </TabsTrigger>
                <TabsTrigger
                  value="messages"
                  className={clx(
                    'flex h-7 items-center gap-1.5 rounded-none rounded-t-sm border-transparent border-b-2 px-1 text-xs',
                    'data-[state=active]:border-primary data-[state=active]:bg-transparent data-[state=active]:shadow-none'
                  )}
                >
                  <Lucide.MessageSquare className="size-3.5" />
                  Messages
                </TabsTrigger>
              </TabsList>
              <div className="flex w-full items-center justify-end gap-4 px-2">
                <div className="flex items-center gap-3 text-muted-foreground text-sm">
                  <div className="flex items-center gap-1.5">
                    <Lucide.Timer className="size-3.5" />
                    <span>0.00s</span>
                  </div>
                  <Separator orientation="vertical" className="h-3" />
                  <span>100 rows</span>
                </div>
              </div>
            </div>

            <TabsContent
              value="results"
              className="custom-datagrid z-[9999] mt-0 h-[calc(100%-36px)] border-t bg-sidebar/80"
              id="portal"
            >
              <DataGrid
                data={data}
                columns={columns}
                enableCopyPaste
                enableRowMarkers
                enableMultiSelect
                onCellEdited={onCellEdited}
                onSelectionChange={(selection) => {
                  consola.log('Selection:', selection)
                }}
              />
            </TabsContent>
            <TabsContent value="messages" asChild>
              <ScrollArea className="mt-0 size-full h-[calc(100%-36px)] border-t bg-sidebar/80 p-3">
                <div className="rounded-sm bg-background/60 p-3 font-mono text-sm">
                  Query executed successfully
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </ResizablePanel>
      </ResizablePanelGroup>
    </ResizablePanel>
  )
}
