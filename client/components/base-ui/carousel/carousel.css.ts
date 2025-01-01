import { type VariantProps, tv } from 'tailwind-variants'

export const carouselStyles = tv({
  slots: {
    root: 'relative',
    content: 'overflow-hidden',
    inner: 'flex',
    item: 'min-w-0 shrink-0 grow-0 basis-full',
    previous: 'absolute h-8 w-8 rounded-full',
    next: 'absolute h-8 w-8 rounded-full',
    icon: 'h-4 w-4',
  },
  variants: {
    orientation: {
      horizontal: {
        inner: '-ml-4',
        item: 'pl-4',
        previous: '-left-12 top-1/2 -translate-y-1/2',
        next: '-right-12 top-1/2 -translate-y-1/2',
      },
      vertical: {
        inner: '-mt-4 flex-col',
        item: 'pt-4',
        previous: '-top-12 left-1/2 -translate-x-1/2 rotate-90',
        next: '-bottom-12 left-1/2 -translate-x-1/2 rotate-90',
      },
    },
    size: {
      default: {
        previous: 'h-8 w-8',
        next: 'h-8 w-8',
      },
      sm: {
        previous: 'h-6 w-6',
        next: 'h-6 w-6',
      },
      lg: {
        previous: 'h-10 w-10',
        next: 'h-10 w-10',
      },
    },
  },
  defaultVariants: {
    orientation: 'horizontal',
    size: 'default',
  },
})

export type CarouselVariants = VariantProps<typeof carouselStyles>
