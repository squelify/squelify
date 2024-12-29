import '@glideapps/glide-data-grid/dist/index.css'
import { CompactSelection, DataEditor, GridCellKind } from '@glideapps/glide-data-grid'
import type { GridCell, GridColumn, GridSelection, Item } from '@glideapps/glide-data-grid'
import { useCallback, useEffect, useRef, useState } from 'react'
import { clx } from '#/utils/helper'

import { calculateColumnWidths, useDataGridTheme } from './helper'
import { DataGridProps, SearchState } from './types'
import '../../styles/datagrid.css'

export function DataGrid<T extends Record<string, any>>({
  data,
  columns,
  enableSearch = false,
  enableRowMarkers = true,
  enableMultiSelect = true,
  onSelectionChange,
  searchInputRef: externalSearchInputRef,
  rowHeight = 28, // Slightly smaller default
  customTheme,
  className,
}: DataGridProps<T>) {
  // States and Refs
  const defaultSearchInputRef = useRef<HTMLInputElement>(null)
  const searchInputRef = externalSearchInputRef || defaultSearchInputRef
  const [columnSizes, setColumnSizes] = useState(() => calculateColumnWidths(data, columns))
  const [searchState, setSearchState] = useState<SearchState>({
    value: '',
    showSearch: false,
    results: [],
    selectedIndex: -1,
  })
  const [selection, setSelection] = useState<GridSelection>({
    rows: CompactSelection.empty(),
    columns: CompactSelection.empty(),
  })

  // Set datagrid theme
  const tableTheme = useDataGridTheme(customTheme)

  // Search keyboard shortcut
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === 'f') {
        e.preventDefault()
        setSearchState((prev) => ({ ...prev, showSearch: true }))
        searchInputRef.current?.focus()
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [searchInputRef])

  // Column width recalculation
  useEffect(() => {
    setColumnSizes(calculateColumnWidths(data, columns))
  }, [data, columns])

  // Focus search input when search is opened
  useEffect(() => {
    if (searchState.showSearch && searchInputRef.current) {
      searchInputRef.current.focus()
    }
  }, [searchState.showSearch, searchInputRef])

  // Handlers
  const handleColumnResize = useCallback((column: GridColumn, newSize: number) => {
    const minWidth = 80 // Minimum width in pixels
    setColumnSizes((prev) => ({
      ...prev,
      [column.id as string]: Math.max(newSize, minWidth),
    }))
  }, [])

  const handleSelectionChange = useCallback(
    (newSelection: GridSelection) => {
      setSelection(newSelection)
      onSelectionChange?.(newSelection)
    },
    [onSelectionChange]
  )

  // Search handlers
  const handleSearchClose = useCallback(() => {
    setSearchState((prev) => ({
      ...prev,
      showSearch: false,
      value: '',
      results: [],
      selectedIndex: -1,
    }))
  }, [])

  const handleSearchChange = useCallback((value: string) => {
    setSearchState((prev) => ({ ...prev, value }))
  }, [])

  const handleSearchResults = useCallback((results: readonly Item[], navIndex: number) => {
    setSearchState((prev) => ({
      ...prev,
      results: [...results],
      selectedIndex: navIndex,
    }))
  }, [])

  const getCellContent = useCallback(
    (cell: Item): GridCell => {
      const [col, row] = cell
      const dataRow = data[row]
      const columnId = columns[col].id as keyof T
      const value = dataRow[columnId]

      return {
        kind: GridCellKind.Text,
        allowOverlay: true,
        readonly: true,
        displayData: String(value),
        data: value,
      }
    },
    [data, columns]
  )

  return (
    <DataEditor
      className={clx('gdg-style', className)}
      getCellContent={getCellContent}
      onColumnResize={handleColumnResize}
      columns={columns.map((col) => ({
        ...col,
        width: columnSizes[col.id as keyof typeof columnSizes] ?? (col as any).width,
      }))}
      rows={data.length}
      height="100%"
      width="100%"
      gridSelection={selection}
      onGridSelectionChange={handleSelectionChange}
      rangeSelect="multi-rect"
      columnSelect={enableMultiSelect ? 'multi' : 'none'}
      rowSelect={enableMultiSelect ? 'multi' : 'none'}
      showSearch={enableSearch ? searchState.showSearch : false}
      searchValue={searchState.value}
      searchResults={searchState.results}
      onSearchClose={handleSearchClose}
      onSearchValueChange={handleSearchChange}
      onSearchResultsChanged={handleSearchResults}
      rowMarkers={enableRowMarkers ? 'both' : 'none'}
      headerHeight={rowHeight + 2}
      rowHeight={rowHeight}
      theme={tableTheme}
    />
  )
}
