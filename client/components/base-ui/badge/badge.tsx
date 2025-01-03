import { type Assign } from '@ark-ui/react'
import { type HTMLArkProps, ark } from '@ark-ui/react/factory'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { type BadgeVariants, badgeStyles } from './badge.css'

export interface BadgeProps extends Assign<HTMLArkProps<'span'>, BadgeVariants> {
  asChild?: boolean
}

export const Badge = React.forwardRef<HTMLSpanElement, BadgeProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    return (
      <ark.span
        ref={ref}
        className={clx(badgeStyles({ variant, size }), className)}
        asChild={asChild}
        {...props}
      />
    )
  }
)

Badge.displayName = 'Badge'
