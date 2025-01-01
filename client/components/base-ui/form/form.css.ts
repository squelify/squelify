import { type VariantProps, tv } from 'tailwind-variants'

export const formItemStyles = tv({
  base: 'space-y-2',
})

export const formLabelStyles = tv({
  base: '',
  variants: {
    error: {
      true: 'text-destructive',
    },
  },
})

export const formDescriptionStyles = tv({
  base: 'text-[0.8rem] text-muted-foreground',
})

export const formMessageStyles = tv({
  base: 'font-medium text-[0.8rem] text-destructive',
})

export type FormVariants = VariantProps<typeof formItemStyles>
