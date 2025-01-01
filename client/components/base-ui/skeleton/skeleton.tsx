import * as React from 'react'
import { clx } from '#/utils/helper'
import { skeletonStyles } from './skeleton.css'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clx(skeletonStyles(), className)} {...props} />
}

export { Skeleton }
