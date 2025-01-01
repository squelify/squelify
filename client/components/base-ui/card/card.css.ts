import { type VariantProps, tv } from 'tailwind-variants'

export const cardStyles = tv({
  base: 'rounded-lg border bg-card text-card-foreground shadow-sm',
})

export const cardHeaderStyles = tv({
  base: 'flex flex-col space-y-1.5 p-6',
})

export const cardTitleStyles = tv({
  base: 'font-semibold leading-none tracking-tight',
})

export const cardDescriptionStyles = tv({
  base: 'text-muted-foreground text-sm',
})

export const cardContentStyles = tv({
  base: 'p-6 pt-0',
})

export const cardFooterStyles = tv({
  base: 'flex items-center p-6 pt-0',
})

export type CardVariants = VariantProps<typeof cardStyles>
