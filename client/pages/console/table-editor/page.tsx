import { EditableGridCell, GridCellKind, GridColumn, Item } from '@glideapps/glide-data-grid'
import consola from 'consola'
import * as Lucide from 'lucide-react'
import { useQueryState } from 'nuqs'
import { useCallback } from 'react'
import { Button, ResizablePanel, ResizablePanelGroup } from '#/components/base-ui'
import DataGrid from '#/components/datagrid'
import PageWrapper from '#/layouts/page-wrapper'
import { generateEmail, generateName, generatePhone, getRandomElement } from '#/utils/dummy'

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
// Ganti definisi data yang ada dengan:
const data = generateDummyData(TOTAL_ROWS)

// Grid columns may also provide icon, overlayIcon, menu, style, and theme overrides
const columns: GridColumn[] = [
  { id: 'name', title: 'Name', width: 150 },
  { id: 'company', title: 'Company', width: 150 },
  { id: 'email', title: 'Email', width: 150 },
  { id: 'phone', title: 'Phone', width: 150 },
]

const EmptyState = () => {
  return (
    <div className="mx-auto flex size-full items-center justify-center">
      <div className="flex max-w-lg flex-col items-center p-4 text-center">
        <div className="mb-8">
          <Lucide.Table2
            className="size-24 text-muted-foreground hover:text-primary"
            strokeWidth={1.8}
          />
        </div>
        <h1 className="mb-4 font-bold text-xl">Table Editor</h1>
        <div className="space-y-4 text-muted-foreground">
          <p className="leading-7">
            Browse tables from the sidebar to view and manage your data,{' '}
            <br className="hidden md:inline-block" /> or create a new table to define your database
            structure.
          </p>
        </div>
      </div>
    </div>
  )
}

export default function Page() {
  // Get collectionId from query params
  const [collectionId, _setCollectionId] = useQueryState('collectionId')

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

  return (
    <PageWrapper title="Table Editor">
      <ResizablePanel defaultSize={86} minSize={80} maxSize={86}>
        <ResizablePanelGroup autoSaveId="table-editor" direction="vertical">
          <ResizablePanel defaultSize={100}>
            {collectionId ? (
              <div className="flex size-full flex-col">
                <div className="flex h-10 items-center justify-between border-b bg-muted/20 px-1.5 py-2.5">
                  <Button
                    size="sm"
                    variant="ghost"
                    className="h-7 px-3 text-muted-foreground text-xs hover:bg-muted hover:text-foreground"
                  >
                    <Lucide.Download className="-ml-0.5 mr-1.5 size-3" />
                    <span>Export</span>
                  </Button>
                </div>
                <div id="portal" className="custom-datagrid z-[40] size-full bg-transparent">
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
                </div>
              </div>
            ) : (
              <EmptyState />
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </ResizablePanel>
    </PageWrapper>
  )
}
