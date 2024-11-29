import { type VariantProps, cva } from 'class-variance-authority'
import React from 'react'
import { clx } from '#/utils/helper'

const badgeVariants = cva(
  'inline-flex items-center rounded-md border font-medium text-xs transition-colors',
  {
    variants: {
      variant: {
        default: 'border-transparent bg-primary/10 text-primary-foreground/80',
        secondary: 'border-transparent bg-secondary/20 text-secondary-foreground/80',
        success:
          'border-transparent bg-emerald-100 text-emerald-700 dark:bg-emerald-500/20 dark:text-emerald-300',
        info: 'border-transparent bg-sky-100 text-sky-700 dark:bg-sky-500/20 dark:text-sky-300',
        warning:
          'border-transparent bg-amber-100 text-amber-700 dark:bg-amber-500/20 dark:text-amber-300',
        destructive:
          'border-transparent bg-destructive/10 text-destructive dark:text-destructive-foreground',
        outline:
          'border-input bg-background text-foreground/80 hover:bg-accent/50 hover:text-accent-foreground',
        ghost: 'border-transparent text-muted-foreground hover:bg-muted/50',
      },
      size: {
        sm: 'px-2 py-0.5 text-[10px]',
        default: 'px-2.5 py-0.5 text-xs',
        lg: 'px-3 py-1 text-sm',
      },
      rounded: {
        default: 'rounded-md',
        full: 'rounded-full',
      },
    },
    defaultVariants: {
      variant: 'default',
      size: 'default',
      rounded: 'default',
    },
  }
)

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

function Badge({ className, variant, size, rounded, ...props }: BadgeProps) {
  return <div className={clx(badgeVariants({ variant, size, rounded }), className)} {...props} />
}

export { Badge, badgeVariants }
