import { type VariantProps, tv } from 'tailwind-variants'

export const carouselStyles = tv({
  base: 'relative',
})

export const carouselContentStyles = tv({
  base: 'overflow-hidden',
  variants: {
    orientation: {
      horizontal: '-ml-4',
      vertical: '-mt-4 flex-col',
    },
  },
})

export const carouselItemStyles = tv({
  base: 'min-w-0 shrink-0 grow-0 basis-full',
  variants: {
    orientation: {
      horizontal: 'pl-4',
      vertical: 'pt-4',
    },
  },
})

export const carouselPreviousStyles = tv({
  base: 'absolute h-8 w-8 rounded-full',
  variants: {
    orientation: {
      horizontal: '-left-12 -translate-y-1/2 top-1/2',
      vertical: '-top-12 -translate-x-1/2 left-1/2 rotate-90',
    },
  },
})

export const carouselNextStyles = tv({
  base: 'absolute h-8 w-8 rounded-full',
  variants: {
    orientation: {
      horizontal: '-right-12 -translate-y-1/2 top-1/2',
      vertical: '-bottom-12 -translate-x-1/2 left-1/2 rotate-90',
    },
  },
})

export type CarouselVariants = VariantProps<typeof carouselStyles>
