import { type VariantProps, tv } from 'tailwind-variants'

export const tabsStyles = tv({
  slots: {
    list: 'inline-flex items-center justify-center rounded-lg bg-muted p-1 text-muted-foreground',
    trigger: [
      'inline-flex items-center justify-center whitespace-nowrap rounded-md px-3 py-1 text-sm font-medium',
      'ring-offset-background transition-all focus:ring-0 focus-visible:outline-none',
      'focus-visible:ring-1 focus-visible:ring-ring focus-visible:ring-offset-2',
      'disabled:pointer-events-none disabled:opacity-50',
      'data-[state=active]:bg-background data-[state=active]:text-foreground data-[state=active]:shadow',
    ],
    content: [
      'mt-2 ring-offset-background focus:ring-0',
      'focus-visible:outline-none focus-visible:ring-1',
      'focus-visible:ring-ring focus-visible:ring-offset-2',
    ],
  },
  variants: {
    size: {
      default: {
        trigger: 'h-9 px-3',
        content: 'mt-2',
      },
      sm: {
        trigger: 'h-8 px-2',
        content: 'mt-1',
      },
      lg: {
        trigger: 'h-10 px-4',
        content: 'mt-3',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type TabsVariants = VariantProps<typeof tabsStyles>
