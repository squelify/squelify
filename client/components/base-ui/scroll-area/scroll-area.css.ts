import { type VariantProps, tv } from 'tailwind-variants'

export const scrollAreaStyles = tv({
  base: 'relative overflow-hidden',
})

export const scrollAreaViewportStyles = tv({
  base: 'h-full w-full rounded-[inherit]',
})

export const scrollBarStyles = tv({
  base: ['flex touch-none select-none transition-colors'],
  variants: {
    orientation: {
      vertical: 'h-full w-2.5 border-l border-l-transparent p-[1px]',
      horizontal: 'h-2.5 flex-col border-t border-t-transparent p-[1px]',
    },
  },
})

export const scrollBarThumbStyles = tv({
  base: 'relative flex-1 rounded-full bg-border',
})

export type ScrollAreaVariants = VariantProps<typeof scrollAreaStyles>
