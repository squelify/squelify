import { type VariantProps, tv } from 'tailwind-variants'

export const drawerOverlayStyles = tv({
  base: 'fixed inset-0 z-50 bg-black/80',
})

export const drawerContentStyles = tv({
  base: 'fixed inset-x-0 bottom-0 z-50 mt-24 flex h-auto flex-col rounded-t-[10px] border bg-background',
})

export const drawerHandleStyles = tv({
  base: 'mx-auto mt-4 h-2 w-[100px] rounded-full bg-muted',
})

export const drawerHeaderStyles = tv({
  base: 'grid gap-1.5 p-4 text-center sm:text-left',
})

export const drawerFooterStyles = tv({
  base: 'mt-auto flex flex-col gap-2 p-4',
})

export const drawerTitleStyles = tv({
  base: 'font-semibold text-lg leading-none tracking-tight',
})

export const drawerDescriptionStyles = tv({
  base: 'text-muted-foreground text-sm',
})

export type DrawerVariants = VariantProps<typeof drawerContentStyles>
