import { type VariantProps, tv } from 'tailwind-variants'

export const sidebarStyles = tv({
  slots: {
    wrapper: 'group/sidebar-wrapper flex min-h-svh w-full has-[[data-variant=inset]]:bg-sidebar',
    sidebar: [
      'flex h-full w-[--sidebar-width] flex-col bg-sidebar text-sidebar-foreground',
      'group-data-[variant=floating]:rounded-lg group-data-[variant=floating]:border',
      'group-data-[variant=floating]:border-sidebar-border group-data-[variant=floating]:shadow',
    ],
    rail: [
      '-translate-x-1/2 group-data-[side=left]:-right-4 absolute inset-y-0 z-20 hidden w-4',
      'transition-all ease-linear after:absolute after:inset-y-0 after:left-1/2 after:w-[2px]',
      'hover:after:bg-sidebar-border group-data-[side=right]:left-0 sm:flex',
      '[[data-side=left]_&]:cursor-w-resize [[data-side=right]_&]:cursor-e-resize',
      '[[data-side=left][data-state=collapsed]_&]:cursor-e-resize [[data-side=right][data-state=collapsed]_&]:cursor-w-resize',
      'group-data-[collapsible=offcanvas]:translate-x-0 group-data-[collapsible=offcanvas]:hover:bg-sidebar',
      'group-data-[collapsible=offcanvas]:after:left-full',
      '[[data-side=left][data-collapsible=offcanvas]_&]:-right-2',
      '[[data-side=right][data-collapsible=offcanvas]_&]:-left-2',
    ],
    input: [
      'h-8 w-full bg-background shadow-none',
      'focus:ring-0 focus-visible:ring-1 focus-visible:ring-primary/50',
    ],
    header: 'flex flex-col gap-2 p-2',
    footer: 'flex flex-col gap-2 p-2',
    content:
      'flex min-h-0 flex-1 flex-col gap-2 overflow-auto group-data-[collapsible=icon]:overflow-hidden',
    group: 'relative flex w-full min-w-0 flex-col p-2',
    groupLabel: [
      'flex h-8 shrink-0 items-center rounded-md px-2 font-medium text-sidebar-foreground/70 text-xs',
      'outline-none ring-sidebar-ring transition-[margin,opacity] duration-200 ease-linear',
      'focus:ring-0 focus-visible:ring-1 [&>svg]:size-4 [&>svg]:shrink-0',
      'group-data-[collapsible=icon]:-mt-8 group-data-[collapsible=icon]:opacity-0',
    ],
    groupAction: [
      'absolute top-3.5 right-3 flex aspect-square w-5 items-center justify-center rounded-md p-0',
      'text-sidebar-foreground outline-none ring-sidebar-ring transition-transform',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:ring-0 focus-visible:ring-1',
      '[&>svg]:size-4 [&>svg]:shrink-0',
      'after:-inset-2 after:absolute after:md:hidden',
      'group-data-[collapsible=icon]:hidden',
    ],
    menu: 'flex w-full min-w-0 flex-col gap-1',
    menuItem: 'group/menu-item relative',
    menuButton: [
      'peer/menu-button group-data-[collapsible=icon]:!size-8 group-data-[collapsible=icon]:!p-2',
      'flex w-full items-center gap-2 overflow-hidden rounded-md p-2 text-left text-sm',
      'outline-none ring-sidebar-ring transition-[width,height,padding]',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:ring-0 focus-visible:ring-1',
      'active:bg-sidebar-accent active:text-sidebar-accent-foreground disabled:pointer-events-none',
      'disabled:opacity-50 group-has-[[data-sidebar=menu-action]]/menu-item:pr-8',
      'aria-disabled:pointer-events-none aria-disabled:opacity-50',
      'data-[active=true]:bg-sidebar-accent data-[active=true]:font-medium',
      'data-[active=true]:text-sidebar-accent-foreground',
      'data-[state=open]:hover:bg-sidebar-accent data-[state=open]:hover:text-sidebar-accent-foreground',
      '[&>span:last-child]:truncate [&>svg]:size-4 [&>svg]:shrink-0',
    ],
    menuAction: [
      'absolute top-1.5 right-1 flex aspect-square w-5 items-center justify-center rounded-md p-0',
      'text-sidebar-foreground outline-none ring-sidebar-ring transition-transform',
      'hover:bg-sidebar-accent hover:text-sidebar-accent-foreground focus:ring-0 focus-visible:ring-1',
      'peer-hover/menu-button:text-sidebar-accent-foreground [&>svg]:size-4 [&>svg]:shrink-0',
      'after:-inset-2 after:absolute after:md:hidden',
      'peer-data-[size=sm]/menu-button:top-1',
      'peer-data-[size=default]/menu-button:top-1.5',
      'peer-data-[size=lg]/menu-button:top-2.5',
      'group-data-[collapsible=icon]:hidden',
    ],
    menuBadge: [
      'pointer-events-none absolute right-1 flex h-5 min-w-5 select-none items-center',
      'justify-center rounded-md px-1 font-medium text-sidebar-foreground text-xs tabular-nums',
      'peer-hover/menu-button:text-sidebar-accent-foreground',
      'peer-data-[active=true]/menu-button:text-sidebar-accent-foreground',
      'peer-data-[size=sm]/menu-button:top-1',
      'peer-data-[size=default]/menu-button:top-1.5',
      'peer-data-[size=lg]/menu-button:top-2.5',
      'group-data-[collapsible=icon]:hidden',
    ],
    menuSkeleton: 'flex h-8 items-center gap-2 rounded-md px-2',
    menuSkeletonIcon: 'size-4 rounded-md',
    menuSkeletonText: 'h-4 max-w-[--skeleton-width] flex-1',
    menuSub: [
      'mx-3.5 flex min-w-0 translate-x-px flex-col gap-1 border-sidebar-border border-l px-2.5 py-0.5',
      'group-data-[collapsible=icon]:hidden',
    ],
    menuSubButton: [
      '-translate-x-px flex h-7 min-w-0 items-center gap-2 overflow-hidden rounded-md px-2',
      'text-sidebar-foreground outline-none ring-sidebar-ring hover:bg-sidebar-accent',
      'hover:text-sidebar-accent-foreground focus:ring-0 focus-visible:ring-1',
      'active:bg-sidebar-accent active:text-sidebar-accent-foreground',
      'disabled:pointer-events-none disabled:opacity-50',
      'aria-disabled:pointer-events-none aria-disabled:opacity-50 [&>span:last-child]:truncate',
      '[&>svg]:size-4 [&>svg]:shrink-0 [&>svg]:text-sidebar-accent-foreground',
      'data-[active=true]:bg-sidebar-accent data-[active=true]:text-sidebar-accent-foreground',
      'group-data-[collapsible=icon]:hidden',
    ],
  },
  variants: {
    variant: {
      sidebar: {},
      floating: {
        sidebar: 'p-2',
      },
      inset: {
        sidebar: 'p-2',
      },
    },
    size: {
      default: {
        menuButton: 'h-8 text-sm',
        menuSubButton: 'text-sm',
      },
      sm: {
        menuButton: 'h-7 text-xs',
        menuSubButton: 'text-xs',
      },
      lg: {
        menuButton: 'h-12 text-sm',
        menuSubButton: 'text-sm',
      },
    },
  },
  defaultVariants: {
    variant: 'sidebar',
    size: 'default',
  },
})

export type SidebarVariants = VariantProps<typeof sidebarStyles>
