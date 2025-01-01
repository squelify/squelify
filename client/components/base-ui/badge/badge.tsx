import * as React from 'react'
import { clx } from '#/utils/helper'
import { type BadgeVariants, badgeStyles } from './badge.css'

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, BadgeVariants {}

function Badge({ className, variant, size, rounded, ...props }: BadgeProps) {
  return <div className={clx(badgeStyles({ variant, size, rounded }), className)} {...props} />
}

Badge.displayName = 'Badge'

export { Badge, badgeStyles }
