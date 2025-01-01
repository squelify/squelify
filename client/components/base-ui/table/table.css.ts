import { type VariantProps, tv } from 'tailwind-variants'

export const tableStyles = tv({
  slots: {
    root: 'w-full caption-bottom text-sm',
    header: '[&_tr]:border-b',
    body: '[&_tr:last-child]:border-0',
    footer: 'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
    row: 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
    head: [
      'h-10 px-2 text-left align-middle font-medium text-muted-foreground',
      '[&:has([role=checkbox])]:pr-0',
      '[&>[role=checkbox]]:translate-y-[2px]',
    ],
    cell: [
      'p-2 align-middle',
      '[&:has([role=checkbox])]:pr-0',
      '[&>[role=checkbox]]:translate-y-[2px]',
    ],
    caption: 'mt-4 text-sm text-muted-foreground',
    wrapper: 'relative w-full overflow-auto',
  },
  variants: {
    size: {
      default: {
        head: 'h-10 px-2',
        cell: 'p-2',
      },
      sm: {
        head: 'h-8 px-1',
        cell: 'p-1',
      },
      lg: {
        head: 'h-12 px-4',
        cell: 'p-4',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type TableVariants = VariantProps<typeof tableStyles>
