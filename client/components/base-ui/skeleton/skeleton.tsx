import { clx } from '#/utils/helper'

function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return <div className={clx('animate-pulse rounded-md bg-foreground/10', className)} {...props} />
}

export { Skeleton }
