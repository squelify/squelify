import { EditorView } from 'codemirror'

export const editorTheme = EditorView.theme({
  // Root container
  '&': {
    height: '100%',
  },

  // Editor core
  '.cm-editor': {
    height: '100%',
  },
  '.cm-scroller': {
    overflow: 'auto',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '14px',
    fontWeight: '400',
    paddingBottom: '12px',
    '&::-webkit-scrollbar': {
      width: '8px',
      height: '8px',
    },
    '&::-webkit-scrollbar-track': {
      background: 'transparent',
    },
    '&::-webkit-scrollbar-thumb': {
      background: 'hsl(var(--muted) / 0.3)',
      borderRadius: '4px',
    },
  },

  // Content area
  '.cm-content': {
    padding: '8px 0',
    caretColor: 'hsl(var(--foreground))',
    minHeight: '100%',
  },
  '.cm-line': {
    padding: '0 8px',
    lineHeight: '1.6',
  },

  // Line numbers and gutters
  '.cm-gutters': {
    position: 'sticky',
    left: 0,
    backgroundColor: 'hsl(var(--background))',
    border: 'none',
    borderRight: '1px solid hsl(var(--border))',
    color: 'hsl(var(--muted-foreground) / 0.6)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '13px',
    fontWeight: '400',
    minWidth: '32px',
    paddingLeft: '8px',
    paddingRight: '8px',
    userSelect: 'none',
    zIndex: '1',
  },
  '.cm-lineNumbers': {
    minWidth: '32px',
    backgroundColor: 'hsl(var(--background))',
  },

  // Code folding
  '.cm-foldGutter': {
    marginLeft: '-12px',
  },
  '.cm-gutterElement': {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
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
      color: 'hsl(var(--foreground))',
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
    backgroundColor: 'hsl(var(--background))',
    color: 'hsl(var(--foreground) / 0.8)',
    fontWeight: '500',
  },
  '.cm-activeLine': {
    backgroundColor: 'hsl(var(--muted) / 0.3)',
  },
  '.cm-selectionMatch': {
    backgroundColor: 'hsl(var(--muted) / 0.3)',
  },

  // Cursor
  '.cm-cursor': {
    borderLeftColor: 'hsl(var(--foreground))',
    borderLeftWidth: '2px',
  },
  '.cm-focused': {
    outline: 'none !important',
  },

  // Autocomplete popover
  '.cm-tooltip': {
    backgroundColor: 'hsl(var(--background))',
    border: '1px solid hsl(var(--border))',
    borderRadius: '6px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  },
  '.cm-tooltip.cm-tooltip-autocomplete': {
    '& > ul': {
      fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
      fontSize: '13px',
      maxHeight: '20rem',
      minWidth: '15rem',
      padding: '4px',
      '&::-webkit-scrollbar': {
        width: '6px',
        height: '6px',
      },
      '&::-webkit-scrollbar-track': {
        background: 'transparent',
      },
      '&::-webkit-scrollbar-thumb': {
        background: 'hsl(var(--muted) / 0.3)',
        borderRadius: '3px',
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
      backgroundColor: 'hsl(var(--accent) / 0.9)',
      color: 'hsl(var(--accent-foreground))',
    },
  },

  // Completion items styling
  '.cm-completionIcon': {
    marginRight: '8px',
    color: 'hsl(var(--muted-foreground))',
    opacity: 0.8,
  },
  '.cm-completionDetail': {
    fontStyle: 'normal',
    fontSize: '12px',
    color: 'hsl(var(--muted-foreground))',
    marginLeft: '8px',
    opacity: 0.8,
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-completionLabel': {
    fontSize: '13px',
    fontWeight: '500',
    color: 'hsl(var(--foreground))',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-completionMatchedText': {
    color: 'hsl(var(--primary))',
    fontWeight: '600',
    textDecoration: 'none',
  },

  // Documentation tooltip
  '.cm-tooltip.cm-tooltip-autocomplete .cm-completionInfo': {
    backgroundColor: 'hsl(var(--popover) / 0.95)',
    backdropFilter: 'blur(4px)',
    border: '1px solid hsl(var(--border) / 0.8)',
    borderRadius: '4px',
    boxShadow: '0 2px 4px -1px rgb(0 0 0 / 0.05)',
    color: 'hsl(var(--popover-foreground) / 0.9)',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
    fontSize: '12px',
    fontWeight: '400',
    lineHeight: '1.5',
    marginLeft: '4px',
    maxWidth: '20rem',
    padding: '6px 8px',
    position: 'absolute',
    left: '100%',
    top: '0',
  },
  '.cm-tooltip.cm-tooltip-autocomplete .cm-completionInfo.cm-completionInfo-right': {
    left: 'auto',
    right: '100%',
  },
  '.cm-tooltip.cm-tooltip-autocomplete .cm-completionInfo-label': {
    color: 'hsl(var(--foreground) / 0.9)',
    fontSize: '13px',
    fontWeight: '500',
    marginBottom: '2px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },
  '.cm-tooltip.cm-tooltip-autocomplete .cm-completionInfo-detail': {
    color: 'hsl(var(--muted-foreground) / 0.8)',
    fontSize: '11px',
    marginTop: '2px',
    fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
  },

  // Syntax highlighting
  '.cm-keyword': { color: 'hsl(var(--primary))', fontWeight: '500' },
  '.cm-operator': { color: 'hsl(var(--foreground))' },
  '.cm-string': { color: 'hsl(var(--success))' },
  '.cm-number': { color: 'hsl(var(--warning))' },
  '.cm-comment': { color: 'hsl(var(--muted-foreground))' },
})
