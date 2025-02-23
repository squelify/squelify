import { EditorView } from '@codemirror/view'
import type { EditorTheme } from '../types'

/** Font stack for editor monospace text */
const EDITOR_FONT = 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace'

/** Editor color schemes */
const editorColors = {
  light: {
    background: 'hsl(210 40% 98%)',
    foreground: 'hsl(225 12% 12%)',
    border: 'hsl(214.3 31.8% 91.4%)',
    selection: 'hsl(210 40% 96.1% / 0.3)',
    activeLine: 'hsl(210 40% 96.1% / 0.3)',
    gutterBackground: 'hsl(210 40% 96.1%)',
    gutterForeground: 'hsl(215 16% 46.1%)',
    tooltipBackground: 'hsl(0 0% 100%)',
    tooltipForeground: 'hsl(225 12% 12%)',
    tooltipBorder: 'hsl(214.3 31.8% 91.4%)',
    scrollbarTrack: 'hsl(210 40% 96.1% / 0.2)',
    scrollbarThumb: 'hsl(215 16% 46.1% / 0.45)',
    scrollbarHover: 'hsl(215 16% 46.1% / 0.5)',
    // ... extra colors
    accent: 'hsl(210 40% 96.1%)',
    accentForeground: 'hsl(225 12% 12%)',
    primary: 'hsl(48 95% 50%)',
    success: 'hsl(142.1 76.2% 36.3%)',
    warning: 'hsl(47.9 95.8% 53.1%)',
    muted: 'hsl(210 40% 96.1%)',
    mutedForeground: 'hsl(215 16% 46.1%)',
  },
  dark: {
    background: 'hsl(225 12% 8.5%)',
    foreground: 'hsl(210 6% 98%)',
    border: 'hsl(225 12% 18%)',
    selection: 'hsl(225 12% 16% / 0.3)',
    activeLine: 'hsl(225 12% 16% / 0.3)',
    gutterBackground: 'hsl(225 12% 16%)',
    gutterForeground: 'hsl(215 6% 72%)',
    tooltipBackground: 'hsl(225 12% 12%)',
    tooltipForeground: 'hsl(210 6% 98%)',
    tooltipBorder: 'hsl(225 12% 18%)',
    scrollbarTrack: 'hsl(225 12% 16% / 0.2)',
    scrollbarThumb: 'hsl(215 6% 72% / 0.35)',
    scrollbarHover: 'hsl(215 6% 72% / 0.4)',
    // ... extra colors
    accent: 'hsl(225 12% 16%)',
    accentForeground: 'hsl(210 6% 98%)',
    primary: 'hsl(48 95% 50%)',
    success: 'hsl(142.1 76.2% 36.3%)',
    warning: 'hsl(47.9 95.8% 53.1%)',
    muted: 'hsl(225 12% 16%)',
    mutedForeground: 'hsl(215 6% 72%)',
  },
}

const createEditorTheme = (colors: typeof editorColors.light | typeof editorColors.dark) => {
  return EditorView.theme({
    // Root container
    '&': {
      height: '100%',
      backgroundColor: colors.background,
      color: colors.foreground,
    },

    // Editor core
    '.cm-editor': {
      height: '100%',
    },
    '.cm-scroller': {
      overflow: 'auto',
      fontFamily: EDITOR_FONT,
      fontSize: '14px',
      fontWeight: '400',
      '&::-webkit-scrollbar': {
        width: '10px',
        height: '10px',
      },
      '&::-webkit-scrollbar-track': {
        background: colors.scrollbarTrack,
      },
      '&::-webkit-scrollbar-thumb': {
        background: colors.scrollbarThumb,
        borderRadius: '1px',
        '&:hover': {
          background: colors.scrollbarHover,
        },
      },
    },

    // Content area
    '.cm-content': {
      padding: '8px 0',
      caretColor: colors.foreground,
      minHeight: '100%',
    },
    '.cm-line': {
      padding: '0 8px',
      lineHeight: '1.6',
    },

    // Line numbers and gutters
    '.cm-gutters': {
      display: 'flex',
      position: 'sticky',
      left: 0,
      backgroundColor: colors.gutterBackground,
      color: colors.gutterForeground,
      border: 'none',
      borderRight: `1px solid ${colors.border}`,
      fontFamily: EDITOR_FONT,
      fontSize: '13px',
      fontWeight: '400',
      userSelect: 'none',
      zIndex: '1',
    },
    '.cm-lineNumbers': {
      minWidth: '3.5ch',
      paddingLeft: '24px',
      paddingRight: '6px',
      textAlign: 'right',
    },

    // Code folding
    '.cm-foldGutter': {
      marginLeft: '-4px',
    },
    '.cm-gutterElement': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'end',
      transition: 'color 0.15s',
      position: 'relative',
      lineHeight: '1.6',
    },
    '.cm-foldGutter .cm-gutterElement': {
      cursor: 'pointer',
      fontSize: '16px',
      transition: 'color 0.15s',
      paddingRight: '4px',
      '&:hover': {
        color: colors.foreground,
      },
    },
    '.cm-foldGutter .cm-gutterElement span': {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      width: '18px',
      height: '18px',
      transform: 'scale(1.2)',
      position: 'relative',
      top: '0',
      lineHeight: '1',
    },

    // Active line highlighting
    '.cm-activeLineGutter': {
      backgroundColor: colors.gutterBackground,
      color: colors.foreground,
      fontWeight: '500',
    },
    '.cm-activeLine': {
      backgroundColor: colors.activeLine,
    },
    '.cm-selectionMatch': {
      backgroundColor: colors.selection,
    },

    // Cursor
    '.cm-cursor': {
      borderLeftColor: colors.foreground,
      borderLeftWidth: '2px',
    },
    '.cm-focused': {
      outline: 'none !important',
    },

    // Autocomplete popover
    '.cm-tooltip': {
      backgroundColor: colors.tooltipBackground,
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: '6px',
      boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
    },
    '.cm-tooltip.cm-tooltip-autocomplete': {
      '& > ul': {
        fontFamily: EDITOR_FONT,
        fontSize: '13px',
        maxHeight: '20rem',
        minWidth: '15rem',
        padding: '4px',
        '&::-webkit-scrollbar': {
          width: '8px',
          height: '8px',
        },
        '&::-webkit-scrollbar-track': {
          background: colors.scrollbarTrack,
        },
        '&::-webkit-scrollbar-thumb': {
          background: colors.scrollbarThumb,
          borderRadius: '1px',
          '&:hover': {
            background: colors.scrollbarHover,
          },
        },
      },
      '& > ul > li': {
        padding: '4px 8px',
        display: 'flex',
        alignItems: 'center',
        position: 'relative',
        gap: '4px',
        transition: 'background-color 0.15s',
        borderRadius: '3px',
      },
      '& > ul > li[aria-selected]': {
        backgroundColor: colors.selection,
        color: colors.foreground,
      },
    },

    // Completion items styling
    '.cm-completionIcon': {
      marginRight: '8px',
      color: colors.gutterForeground,
      opacity: 0.8,
    },
    '.cm-completionDetail': {
      fontStyle: 'normal',
      fontSize: '12px',
      color: colors.gutterForeground,
      marginLeft: '8px',
      opacity: 0.8,
      fontFamily: EDITOR_FONT,
    },
    '.cm-completionLabel': {
      fontSize: '13px',
      fontWeight: '500',
      color: colors.foreground,
      fontFamily: EDITOR_FONT,
    },
    '.cm-completionMatchedText': {
      color: colors.primary,
      fontWeight: '600',
      textDecoration: 'none',
    },

    // Documentation tooltip
    '.cm-tooltip.cm-tooltip-autocomplete .cm-completionInfo': {
      backgroundColor: colors.accent,
      backdropFilter: 'blur(4px)',
      border: `1px solid ${colors.tooltipBorder}`,
      borderRadius: '4px',
      boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.05)',
      color: colors.tooltipForeground,
      fontFamily: EDITOR_FONT,
      fontSize: '12px',
      fontWeight: '400',
      lineHeight: '1.5',
      marginRight: '4px',
      maxWidth: '20rem',
      padding: '6px 8px',
      position: 'absolute',
      right: '100%',
      top: '0',
    },

    // Syntax highlighting
    '.cm-keyword': { color: colors.primary, fontWeight: '500' },
    '.cm-operator': { color: colors.foreground },
    '.cm-string': { color: colors.success },
    '.cm-number': { color: colors.warning },
    '.cm-comment': { color: colors.mutedForeground },

    // Custom button on gutter
    '.cm-run-block-button': {
      all: 'unset',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'flex-start',
      width: '24px',
      height: '24px',
      borderRadius: '6px',
      color: colors.primary,
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      '&:hover': {
        backgroundColor: colors.accent,
        color: colors.accentForeground,
      },
    },
    '.cm-run-block-gutter': {
      width: '24px',
      display: 'flex',
      alignItems: 'flex-start',
      justifyContent: 'flex-start',
      marginRight: '2px',
      marginLeft: '4px',
    },
  })
}

// Get the theme of the app, sync with the theme of the app
// We use data-theme attribute to set the theme
const getAppTheme = (): EditorTheme => {
  if (typeof window === 'undefined') return 'light'
  return document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light'
}

// Get system theme preference
const getSystemTheme = (): EditorTheme => {
  if (typeof window === 'undefined') return 'light'
  return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light'
}

export const getEditorTheme = (theme: EditorTheme = 'auto') => {
  const effectiveTheme = theme === 'auto' ? getAppTheme() : theme
  const fallbackTheme = getSystemTheme()
  return createEditorTheme(
    editorColors[effectiveTheme as keyof typeof editorColors] ||
      editorColors[fallbackTheme as keyof typeof editorColors],
  )
}
