import * as React from 'react'
import { skeletonStyles } from './skeleton.css'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={skeletonStyles({ className })} {...props} />
}

export { Skeleton }
