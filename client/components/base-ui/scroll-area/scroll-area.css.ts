import { type VariantProps, tv } from 'tailwind-variants'

export const scrollAreaStyles = tv({
  slots: {
    root: 'relative overflow-hidden',
    viewport: 'h-full w-full rounded-[inherit]',
    scrollbar: ['flex touch-none select-none transition-colors'],
    thumb: 'relative flex-1 rounded-full bg-border',
    corner: '',
  },
  variants: {
    orientation: {
      vertical: {
        scrollbar: 'h-full w-2.5 border-l border-l-transparent p-[1px]',
      },
      horizontal: {
        scrollbar: 'h-2.5 flex-col border-t border-t-transparent p-[1px]',
      },
    },
    size: {
      default: {
        scrollbar: 'w-2.5',
        thumb: 'w-1.5',
      },
      sm: {
        scrollbar: 'w-2',
        thumb: 'w-1',
      },
      lg: {
        scrollbar: 'w-3',
        thumb: 'w-2',
      },
    },
  },
  defaultVariants: {
    orientation: 'vertical',
    size: 'default',
  },
})

export type ScrollAreaVariants = VariantProps<typeof scrollAreaStyles>
