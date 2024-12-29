import type { DataEditorProps, Item, Theme } from '@glideapps/glide-data-grid'
import type { GridColumn, GridSelection } from '@glideapps/glide-data-grid'

// Define props interface
export interface DataGridProps<T> extends Partial<DataEditorProps> {
  data: T[]
  columns: GridColumn[]
  enableSearch?: boolean
  enableCopyPaste?: boolean
  enableRowMarkers?: boolean
  enableMultiSelect?: boolean
  virtualScrollTimeout?: number
  rowBufferSize?: number
  onSelectionChange?: (selection: GridSelection) => void
  searchInputRef?: React.RefObject<HTMLInputElement | null>
  rowHeight?: number
  customTheme?: Partial<Theme>
  className?: string
}

export interface SearchState {
  value: string
  showSearch: boolean
  results: Item[]
  selectedIndex: number
}
