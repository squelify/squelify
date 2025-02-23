import type { Theme as GlideTheme, GridColumn } from '@glideapps/glide-data-grid'
import { useEffect, useMemo, useState } from 'react'
import type { Theme } from '#/context/stores/ui.store'
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
  },
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

export function useDataGridTheme(customTheme?: Partial<GlideTheme>) {
  const [effectiveTheme, setEffectiveTheme] = useState<Theme>(
    () => document.documentElement.dataset.theme as Theme,
  )

  useEffect(() => {
    const observer = new MutationObserver((mutations) => {
      for (const mutation of mutations) {
        if (mutation.attributeName === 'data-theme') {
          const newTheme = document.documentElement.dataset.theme as Theme
          setEffectiveTheme(
            newTheme === 'system'
              ? window.matchMedia('(prefers-color-scheme: dark)').matches
                ? 'dark'
                : 'light'
              : newTheme,
          )
        }
      }
    })

    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['data-theme'],
    })

    return () => observer.disconnect()
  }, [])

  const tableTheme = useMemo(() => {
    const baseTheme = effectiveTheme === 'dark' ? darkTheme : lightTheme
    return {
      ...baseTheme,
      ...(customTheme || {}),
    }
  }, [effectiveTheme, customTheme])

  return tableTheme
}
