import { type VariantProps, tv } from 'tailwind-variants'

export const drawerStyles = tv({
  slots: {
    overlay: 'fixed inset-0 z-50 bg-black/80',
    content:
      'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
    handle: 'mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted',
    header: 'grid gap-1.5 p-4 text-center sm:text-left',
    footer: 'mt-auto flex flex-col gap-2 p-4',
    title: 'text-lg font-semibold leading-none tracking-tight',
    description: 'text-sm text-muted-foreground',
  },
  variants: {
    size: {
      default: {
        content: 'h-[400px]',
      },
      sm: {
        content: 'h-[300px]',
      },
      lg: {
        content: 'h-[500px]',
      },
    },
    side: {
      bottom: {
        content: 'inset-x-0 bottom-0 mt-24 rounded-t-[10px]',
      },
      top: {
        content: 'inset-x-0 top-0 mb-24 rounded-b-[10px]',
      },
      left: {
        content: 'inset-y-0 left-0 h-full w-3/4 rounded-r-[10px]',
      },
      right: {
        content: 'inset-y-0 right-0 h-full w-3/4 rounded-l-[10px]',
      },
    },
  },
  defaultVariants: {
    size: 'default',
    side: 'bottom',
  },
})

export type DrawerVariants = VariantProps<typeof drawerStyles>
