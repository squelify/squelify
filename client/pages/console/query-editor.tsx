import { GridColumn } from '@glideapps/glide-data-grid'
import { copycat } from '@snaplet/copycat'
import consola from 'consola'
import * as Lucide from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuContent } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuShortcut } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuItem, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { Input } from '#/components/base-ui/input'
import { ResizablePanel, ResizablePanelGroup } from '#/components/base-ui/resizable'
import { ResizableHandle } from '#/components/base-ui/resizable'
import { ScrollArea } from '#/components/base-ui/scroll-area'
import { Separator } from '#/components/base-ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/base-ui/tabs'
import CodeEditor, { type EditorContextData, EditorRef } from '#/components/code-editor'
import DataGrid from '#/components/datagrid'

type DummyItem = {
  name: string
  company: string
  email: string
  phone: string
}

const TOTAL_ROWS = 100

// Helper function untuk generate data
const generateDummyData = (count: number): DummyItem[] => {
  return Array.from({ length: count }, (_, index) => ({
    name: copycat.fullName(`person-${index}`),
    company: copycat.words(`company-${index}`),
    email: copycat.email(`person-${index}`).toLowerCase(),
    phone: copycat.phoneNumber(`person-${index}`),
  }))
}

// Ganti definisi data yang ada dengan:
const data = generateDummyData(TOTAL_ROWS)

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
const columns: GridColumn[] = [
  {
    id: 'name',
    title: 'Name',
    width: 150,
  },
  {
    id: 'company',
    title: 'Company',
    width: 150,
  },
  {
    id: 'email',
    title: 'Email',
    width: 150,
  },
  {
    id: 'phone',
    title: 'Phone',
    width: 150,
  },
]

export default function QueryEditor() {
  const editorRef = useRef<EditorRef>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [_query, setQuery] = useState('SELECT * FROM users;')

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
          <div className="flex h-full flex-col">
            <div className="flex h-10 items-center justify-between border-b bg-muted/20 px-3">
              <div className="flex items-center gap-2">
                <div className="flex">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="group h-7 bg-primary/40 px-4 font-medium text-foreground/70 text-xs hover:bg-primary/70 hover:text-foreground active:scale-[0.98] active:bg-primary/80"
                        disabled={isExecuting}
                      >
                        <span>Run</span>
                        {isExecuting ? (
                          <Lucide.Loader2 className="-mr-1 size-3 animate-spin" />
                        ) : (
                          <Lucide.ChevronDown className="-mr-1 size-3" />
                        )}
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="start" className="w-52 p-1">
                      <DropdownMenuItem
                        className="cursor-pointer rounded-sm px-3 py-1.5 text-muted-foreground text-xs hover:bg-primary/20 hover:text-foreground focus:bg-primary/30"
                        onClick={() => editorRef.current?.execute()}
                      >
                        <span>Run Current Statement</span>
                        <DropdownMenuShortcut>⌘↵</DropdownMenuShortcut>
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        className="cursor-pointer rounded-sm px-3 py-1.5 text-muted-foreground text-xs hover:bg-primary/20 hover:text-foreground focus:bg-primary/30"
                        onClick={() => editorRef.current?.executeAll()}
                      >
                        <span>Run All Statement</span>
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
                  <Lucide.Save className="-ml-0.5 mr-1.5 size-3" />
                  <span>Save</span>
                </Button>
                <Button
                  size="sm"
                  variant="ghost"
                  className="h-7 bg-secondary/80 px-4 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
                >
                  <Lucide.Download className="-ml-0.5 mr-1.5 size-3" />
                  <span>Export</span>
                </Button>

                <div className="p-0">
                  <Input
                    className="h-7 border-transparent bg-background px-2 font-medium text-muted-foreground text-xs shadow-none hover:border-input focus:ring-0 focus-visible:ring-0"
                    value="Untitled query"
                  />
                </div>
              </div>

              <div className="flex items-center gap-3 text-muted-foreground text-sm">
                <div className="flex items-center gap-1.5">
                  <Lucide.Timer className="size-3.5" />
                  <span>0.00s</span>
                </div>
                <Separator orientation="vertical" className="h-3" />
                <span>0 rows</span>
              </div>
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
            <TabsList className="inline-flex h-8 w-full items-center justify-start rounded-none bg-muted/20">
              <TabsTrigger
                value="results"
                className="flex h-6 w-full items-center gap-1.5 px-3 text-xs data-[state=active]:bg-gray-200/60 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-700/60"
              >
                <Lucide.Sheet className="size-3.5" />
                Results
              </TabsTrigger>
              <TabsTrigger
                value="messages"
                className="flex h-6 w-full items-center gap-1.5 px-3 text-xs data-[state=active]:bg-gray-200/60 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-700/60"
              >
                <Lucide.MessageSquare className="size-3.5" />
                Messages
              </TabsTrigger>
            </TabsList>

            <TabsContent value="results" className="h-[calc(100%-32px)]" asChild>
              <div className="custom-datagrid border-t bg-sidebar/80">
                <DataGrid
                  data={data}
                  columns={columns}
                  enableCopyPaste
                  enableRowMarkers
                  enableMultiSelect
                  onSelectionChange={(selection) => {
                    consola.log('Selection:', selection)
                  }}
                />
              </div>
            </TabsContent>
            <TabsContent value="messages" className="h-[calc(100%-32px)]">
              <ScrollArea className="size-full border-t bg-sidebar/80 p-3">
                <div className="rounded bg-background/60 p-3 font-mono text-sm">
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
