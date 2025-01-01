import { type VariantProps, tv } from 'tailwind-variants'

export const commandStyles = tv({
  slots: {
    root: 'flex h-full w-full flex-col overflow-hidden rounded-md bg-popover text-popover-foreground',
    inputWrapper: 'flex items-center border-input border-b px-3',
    input: [
      'flex h-10 w-full rounded-md bg-transparent py-3 text-sm',
      'outline-none ring-offset-background',
      'placeholder:text-muted-foreground',
      'focus-visible:outline-none focus-visible:ring-[1px] focus-visible:ring-primary',
      'disabled:cursor-not-allowed disabled:opacity-50',
    ],
    list: 'max-h-[300px] overflow-y-auto overflow-x-hidden',
    empty: 'py-6 text-center text-sm',
    group: [
      'overflow-hidden p-1 text-foreground',
      '[&_[cmdk-group-heading]]:px-2 [&_[cmdk-group-heading]]:py-1.5',
      '[&_[cmdk-group-heading]]:font-medium [&_[cmdk-group-heading]]:text-muted-foreground',
      '[&_[cmdk-group-heading]]:text-xs',
    ],
    separator: '-mx-1 h-px bg-border',
    item: [
      'relative flex cursor-default select-none items-center gap-2 rounded-sm px-2 py-1.5 text-sm outline-none',
      'data-[disabled=true]:pointer-events-none data-[selected=true]:bg-accent',
      'data-[selected=true]:text-accent-foreground data-[disabled=true]:opacity-50',
      '[&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0',
    ],
    shortcut: 'ml-auto text-muted-foreground text-xs tracking-widest',
    icon: 'mr-2 size-4 shrink-0 opacity-50',
  },
  variants: {
    size: {
      default: {
        root: 'h-[400px]',
        list: 'max-h-[300px]',
      },
      sm: {
        root: 'h-[300px]',
        list: 'max-h-[200px]',
      },
      lg: {
        root: 'h-[500px]',
        list: 'max-h-[400px]',
      },
    },
  },
  defaultVariants: {
    size: 'default',
  },
})

export type CommandVariants = VariantProps<typeof commandStyles>
