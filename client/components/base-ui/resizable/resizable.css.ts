import { type VariantProps, tv } from 'tailwind-variants'

export const resizableStyles = tv({
  slots: {
    panelGroup: 'flex h-full w-full data-[panel-group-direction=vertical]:flex-col',
    handle: [
      'group relative flex w-px items-center justify-center bg-border',
      'hover:bg-foreground/20 transition-colors',
      'after:absolute after:inset-y-0 after:left-1/2 after:w-1 after:-translate-x-1/2',
      'focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-1',
      'data-[panel-group-direction=vertical]:h-px data-[panel-group-direction=vertical]:w-full',
      'data-[panel-group-direction=vertical]:after:left-0 data-[panel-group-direction=vertical]:after:h-1',
      'data-[panel-group-direction=vertical]:after:w-full data-[panel-group-direction=vertical]:after:translate-x-0',
      '[&[data-panel-group-direction=vertical]>div]:rotate-90',
    ],
    handleIcon: [
      'z-10 flex h-4 w-3 items-center justify-center rounded-sm border bg-border',
      'opacity-0 transition-opacity group-hover:opacity-100',
    ],
    icon: 'h-2.5 w-2.5',
  },
  variants: {
    fixed: {
      panelGroup: 'fixed inset-0',
    },
    direction: {
      horizontal: {
        panelGroup: 'flex-row',
      },
      vertical: {
        panelGroup: 'flex-col',
      },
    },
  },
  defaultVariants: {
    direction: 'horizontal',
  },
})

export type ResizableVariants = VariantProps<typeof resizableStyles>
