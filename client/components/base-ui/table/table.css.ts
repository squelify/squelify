import { type VariantProps, tv } from 'tailwind-variants'

export const tableStyles = tv({
  base: 'w-full caption-bottom text-sm',
})

export const tableHeaderStyles = tv({
  base: '[&_tr]:border-b',
})

export const tableBodyStyles = tv({
  base: '[&_tr:last-child]:border-0',
})

export const tableFooterStyles = tv({
  base: 'border-t bg-muted/50 font-medium [&>tr]:last:border-b-0',
})

export const tableRowStyles = tv({
  base: 'border-b transition-colors hover:bg-muted/50 data-[state=selected]:bg-muted',
})

export const tableHeadStyles = tv({
  base: [
    'h-10 px-2 text-left align-middle font-medium text-muted-foreground',
    '[&:has([role=checkbox])]:pr-0',
    '[&>[role=checkbox]]:translate-y-[2px]',
  ],
})

export const tableCellStyles = tv({
  base: [
    'p-2 align-middle',
    '[&:has([role=checkbox])]:pr-0',
    '[&>[role=checkbox]]:translate-y-[2px]',
  ],
})

export const tableCaptionStyles = tv({
  base: 'mt-4 text-muted-foreground text-sm',
})

export type TableVariants = VariantProps<typeof tableStyles>
