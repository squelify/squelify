import { type VariantProps, tv } from 'tailwind-variants'

export const breadcrumbListStyles = tv({
  base: 'flex flex-wrap items-center gap-1.5 break-words text-muted-foreground text-sm sm:gap-2.5',
})

export const breadcrumbItemStyles = tv({
  base: 'inline-flex items-center gap-1.5',
})

export const breadcrumbLinkStyles = tv({
  base: 'transition-colors hover:text-foreground',
})

export const breadcrumbPageStyles = tv({
  base: 'font-normal text-foreground',
})

export const breadcrumbSeparatorStyles = tv({
  base: '[&>svg]:h-3.5 [&>svg]:w-3.5',
})

export const breadcrumbEllipsisStyles = tv({
  base: 'flex h-9 w-9 items-center justify-center',
})

export type BreadcrumbVariants = VariantProps<typeof breadcrumbListStyles>
