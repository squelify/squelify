import { type VariantProps, tv } from 'tailwind-variants'

export const chartContainerStyles = tv({
  base: [
    'flex aspect-video justify-center text-xs',
    '[&_.recharts-cartesian-axis-tick_text]:fill-muted-foreground',
    '[&_.recharts-cartesian-grid_line[stroke="#ccc"]]:stroke-border/50',
    '[&_.recharts-curve.recharts-tooltip-cursor]:stroke-border',
    '[&_.recharts-dot[stroke="#fff"]]:stroke-transparent',
    '[&_.recharts-layer]:outline-none',
    '[&_.recharts-polar-grid_[stroke="#ccc"]]:stroke-border',
    '[&_.recharts-radial-bar-background-sector]:fill-muted',
    '[&_.recharts-rectangle.recharts-tooltip-cursor]:fill-muted',
    '[&_.recharts-reference-line_[stroke="#ccc"]]:stroke-border',
    '[&_.recharts-sector[stroke="#fff"]]:stroke-transparent',
    '[&_.recharts-sector]:outline-none',
    '[&_.recharts-surface]:outline-none',
  ],
})

export const tooltipContentStyles = tv({
  base: 'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
})

export const tooltipItemStyles = tv({
  base: 'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
  variants: {
    indicator: {
      dot: 'items-center',
      line: '',
      dashed: '',
    },
    nested: {
      true: 'items-end',
      false: 'items-center',
    },
  },
})

export const tooltipIndicatorStyles = tv({
  base: 'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
  variants: {
    type: {
      dot: 'h-2.5 w-2.5',
      line: 'w-1',
      dashed: 'w-0 border-[1.5px] border-dashed bg-transparent',
    },
    nested: {
      true: 'my-0.5',
      false: '',
    },
  },
})

export const tooltipLabelStyles = tv({
  base: 'font-medium',
})

export const legendContentStyles = tv({
  base: 'flex items-center justify-center gap-4',
  variants: {
    align: {
      top: 'pb-3',
      bottom: 'pt-3',
    },
  },
})

export const legendItemStyles = tv({
  base: 'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
})

export const legendIconStyles = tv({
  base: 'h-2 w-2 shrink-0 rounded-[2px]',
})

export type ChartVariants = VariantProps<typeof chartContainerStyles>
