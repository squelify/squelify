import type { GridColumn, Theme } from '@glideapps/glide-data-grid'
import { useMemo } from 'react'
import { useTheme } from '#/context/providers/theme-provider'
import { darkTheme, lightTheme } from './styles'

// Helper function to calculate text width (can be memoized if needed)
const measureTextWidth = (text: string, padding = 24): number => {
  return (text?.toString().length || 0) * 8 + padding
}

// Improved column width calculator
export const calculateColumnWidths = <T extends Record<string, any>>(
  data: T[],
  columns: GridColumn[],
  options = {
    minWidth: 80,
    maxWidth: 400,
    padding: 24,
  }
): Record<string, number> => {
  const widths: Record<string, number> = {}

  // Initialize with header widths
  for (const col of columns) {
    if (typeof col.id === 'string') {
      widths[col.id] = Math.max(measureTextWidth(col.title, options.padding), options.minWidth)
    }
  }

  // Measure content widths
  for (const row of data) {
    for (const col of columns) {
      if (typeof col.id === 'string') {
        const content = row[col.id]?.toString() || ''
        const contentWidth = measureTextWidth(content, options.padding)
        widths[col.id] = Math.max(widths[col.id] || 0, contentWidth)
      }
    }
  }

  // Apply min/max constraints
  for (const [id, width] of Object.entries(widths)) {
    widths[id] = Math.min(Math.max(width, options.minWidth), options.maxWidth)
  }

  return widths
}

export function useDataGridTheme(customTheme?: Partial<Theme>) {
  const { theme } = useTheme()

  const effectiveTheme = useMemo(() => {
    // Handle system theme preference
    if (theme === 'system') {
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
    }
    return theme
  }, [theme])

  // Combine base theme with custom overrides
  const tableTheme = useMemo(() => {
    const baseTheme = effectiveTheme === 'dark' ? darkTheme : lightTheme
    return {
      ...baseTheme,
      ...(customTheme || {}),
    }
  }, [effectiveTheme, customTheme])

  return tableTheme
}
