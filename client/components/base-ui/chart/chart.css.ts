import { type VariantProps, tv } from 'tailwind-variants'

export const chartStyles = tv({
  slots: {
    container: [
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
    tooltipContent:
      'grid min-w-[8rem] items-start gap-1.5 rounded-lg border border-border/50 bg-background px-2.5 py-1.5 text-xs shadow-xl',
    tooltipItem:
      'flex w-full flex-wrap items-stretch gap-2 [&>svg]:h-2.5 [&>svg]:w-2.5 [&>svg]:text-muted-foreground',
    tooltipIndicator: 'shrink-0 rounded-[2px] border-[--color-border] bg-[--color-bg]',
    tooltipLabel: 'font-medium',
    legendContent: 'flex items-center justify-center gap-4',
    legendItem: 'flex items-center gap-1.5 [&>svg]:h-3 [&>svg]:w-3 [&>svg]:text-muted-foreground',
    legendIcon: 'h-2 w-2 shrink-0 rounded-[2px]',
  },
  variants: {
    tooltipIndicator: {
      dot: {
        tooltipIndicator: 'h-2.5 w-2.5',
      },
      line: {
        tooltipIndicator: 'w-1',
      },
      dashed: {
        tooltipIndicator: 'w-0 border-[1.5px] border-dashed bg-transparent',
      },
    },
    legendAlign: {
      top: {
        legendContent: 'pb-3',
      },
      bottom: {
        legendContent: 'pt-3',
      },
    },
  },
})

export type ChartVariants = VariantProps<typeof chartStyles>
