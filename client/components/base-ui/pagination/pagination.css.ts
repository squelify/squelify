import { type VariantProps, tv } from 'tailwind-variants'

export const paginationStyles = tv({
  base: 'mx-auto flex w-full justify-center',
})

export const paginationContentStyles = tv({
  base: 'flex flex-row items-center gap-1',
})

export const paginationItemStyles = tv({
  base: '',
})

export const paginationLinkStyles = tv({
  base: 'gap-1',
  variants: {
    isActive: {
      true: '',
      false: '',
    },
    direction: {
      previous: 'pl-2.5',
      next: 'pr-2.5',
    },
  },
})

export const paginationEllipsisStyles = tv({
  base: 'flex h-9 w-9 items-center justify-center',
})

export type PaginationVariants = VariantProps<typeof paginationStyles>
