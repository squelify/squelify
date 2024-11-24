import consola from 'consola'
import * as Lucide from 'lucide-react'
import { useRef, useState } from 'react'
import { Button } from '#/components/base-ui/button'
import { DropdownMenu, DropdownMenuContent } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuShortcut } from '#/components/base-ui/dropdown-menu'
import { DropdownMenuItem, DropdownMenuTrigger } from '#/components/base-ui/dropdown-menu'
import { ResizablePanel, ResizablePanelGroup } from '#/components/base-ui/resizable'
import { ResizableHandle } from '#/components/base-ui/resizable'
import { ScrollArea } from '#/components/base-ui/scroll-area'
import { Separator } from '#/components/base-ui/separator'
import { Table, TableHead, TableHeader } from '#/components/base-ui/table'
import { TableBody, TableCell, TableRow } from '#/components/base-ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '#/components/base-ui/tabs'
import CodeEditor, { EditorRef } from '#/components/code-editor'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'

export default function Component() {
  useSEOMeta('Query Editor')

  const editorRef = useRef<EditorRef>(null)
  const [isExecuting, setIsExecuting] = useState(false)
  const [query, setQuery] = useState('SELECT * FROM users;')

  // Add query execution logic here
  const handleExecute = async (query: string) => {
    setIsExecuting(true)
    try {
      consola.log(query)
      await new Promise((resolve) => setTimeout(resolve, 1500)) // Simulate API call
    } finally {
      setIsExecuting(false)
      requestAnimationFrame(() => {
        editorRef.current?.focus()
      })
    }
  }
  return (
    <div className="flex size-full flex-col bg-background">
      <ResizablePanelGroup autoSaveId="query-editor-root" direction="horizontal" className="flex-1">
        <ResizablePanel defaultSize={14} minSize={12} maxSize={20} className="bg-sidebar/80">
          <Tabs defaultValue="tables" className="h-full">
            <TabsList className="grid h-10 w-full grid-cols-2 rounded-none border-b bg-sidebar/40 px-1 py-0">
              <TabsTrigger
                value="tables"
                className="flex h-7 items-center justify-center gap-1.5 px-3 text-xs hover:bg-background data-[state=active]:bg-gray-200/60 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-700/60"
              >
                <Lucide.Table className="h-3.5 w-3.5" />
                Tables
              </TabsTrigger>
              <TabsTrigger
                value="history"
                className="flex h-7 items-center justify-center gap-1.5 px-3 text-xs hover:bg-background data-[state=active]:bg-gray-200/60 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-700/60"
              >
                <Lucide.Clock className="h-3.5 w-3.5" />
                History
              </TabsTrigger>
            </TabsList>
            <ScrollArea className="h-[calc(100%-32px)]">
              <TabsContent value="tables" className="m-0 p-2">
                <div className="space-y-1">
                  <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <Lucide.Table2 className="h-3.5 w-3.5" />
                      <span>users</span>
                    </div>
                    <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                      12 rows
                    </span>
                  </div>
                  <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <Lucide.Table2 className="h-3.5 w-3.5" />
                      <span>posts</span>
                    </div>
                    <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                      45 rows
                    </span>
                  </div>
                  <div className="group flex select-none items-center justify-between rounded px-2.5 py-1.5 text-muted-foreground text-sm hover:bg-background hover:text-foreground">
                    <div className="flex items-center gap-2">
                      <Lucide.Table2 className="h-3.5 w-3.5" />
                      <span>comments</span>
                    </div>
                    <span className="invisible font-semibold text-muted-foreground/60 text-xs group-hover:visible">
                      89 rows
                    </span>
                  </div>
                </div>
              </TabsContent>

              <TabsContent value="history" className="m-0 p-3">
                <div className="space-y-1">
                  <div className="group select-none rounded px-2.5 py-1.5 hover:bg-background">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Lucide.Clock className="h-3.5 w-3.5 text-muted-foreground" />
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
                        <Lucide.Clock className="h-3.5 w-3.5 text-muted-foreground" />
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
              </TabsContent>
            </ScrollArea>
          </Tabs>
        </ResizablePanel>

        <ResizableHandle withHandle />

        <ResizablePanel defaultSize={85}>
          <ResizablePanelGroup autoSaveId="query-editor-rp" direction="vertical">
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
                  </div>

                  <div className="flex items-center gap-3 text-muted-foreground text-sm">
                    <div className="flex items-center gap-1.5">
                      <Lucide.Timer className="h-3.5 w-3.5" />
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
                    contextData={{
                      tables: ['users', 'posts'],
                      columns: {
                        users: ['id', 'name', 'email'],
                        posts: ['id', 'title', 'content'],
                      },
                    }}
                    placeholder="-- Write your query here"
                    onExecute={handleExecute}
                    isExecuting={isExecuting}
                    value={query}
                    autoFocus
                  />
                </div>
              </div>
            </ResizablePanel>

            <ResizableHandle withHandle />

            <ResizablePanel defaultSize={40}>
              <Tabs defaultValue="results" className="h-full pt-1">
                <TabsList className="inline-flex h-9 w-full items-center justify-start rounded-none bg-muted/20 px-1">
                  <TabsTrigger
                    value="results"
                    className="flex h-7 items-center gap-1.5 px-3 text-xs data-[state=active]:bg-gray-200/60 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-700/60"
                  >
                    <Lucide.Sheet className="h-3.5 w-3.5" />
                    Results
                  </TabsTrigger>
                  <TabsTrigger
                    value="messages"
                    className="flex h-7 items-center gap-1.5 px-3 text-xs data-[state=active]:bg-gray-200/60 data-[state=active]:shadow-none dark:data-[state=active]:bg-gray-700/60"
                  >
                    <Lucide.MessageSquare className="h-3.5 w-3.5" />
                    Messages
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="results" className="h-[calc(100%-34px)] border-t bg-sidebar/80">
                  <ScrollArea className="h-full">
                    <div className="min-w-max">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-background/60 hover:bg-background/80">
                            <TableHead className="text-sm">id</TableHead>
                            <TableHead className="text-sm">name</TableHead>
                            <TableHead className="text-sm">email</TableHead>
                            <TableHead className="text-sm">created_at</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          <TableRow className="hover:bg-background/60">
                            <TableCell className="font-mono text-sm">1</TableCell>
                            <TableCell className="font-mono text-sm">John Doe</TableCell>
                            <TableCell className="font-mono text-sm">john@example.com</TableCell>
                            <TableCell className="font-mono text-sm">2024-01-01</TableCell>
                          </TableRow>
                        </TableBody>
                      </Table>
                    </div>
                  </ScrollArea>
                </TabsContent>
                <TabsContent value="messages" className="size-full border-t bg-sidebar p-3">
                  <div className="rounded bg-background/60 p-3 font-mono text-sm">
                    Query executed successfully
                  </div>
                </TabsContent>
              </Tabs>
            </ResizablePanel>
          </ResizablePanelGroup>
        </ResizablePanel>
      </ResizablePanelGroup>
    </div>
  )
}

Component.displayName = 'QueryEditorPage'
