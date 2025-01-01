import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Link } from '#/components/link'
import { paginationStyles } from './pagination.css'
import type { PaginationVariants } from './pagination.css'

const Pagination = React.forwardRef<HTMLElement, React.ComponentProps<'nav'> & PaginationVariants>(
  ({ className, variant, size, ...props }, ref) => {
    const styles = paginationStyles({ variant, size })
    return (
      <nav ref={ref} aria-label="pagination" className={styles.root({ className })} {...props} />
    )
  }
)

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => {
    const styles = paginationStyles()
    return <ul ref={ref} className={styles.content({ className })} {...props} />
  }
)

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => {
    const styles = paginationStyles()
    return <li ref={ref} className={styles.item({ className })} {...props} />
  }
)

type PaginationLinkProps = {
  isActive?: boolean
  variant?: PaginationVariants['variant']
  size?: PaginationVariants['size']
} & React.ComponentProps<typeof Link>

const PaginationLink = ({ className, isActive, size, variant, ...props }: PaginationLinkProps) => {
  const styles = paginationStyles({ variant, size, isActive })
  return (
    <Link
      aria-current={isActive ? 'page' : undefined}
      className={styles.link({ className })}
      {...props}
    />
  )
}

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => {
  const styles = paginationStyles()
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={styles.link({ className })}
      {...props}
    >
      <Lucide.ChevronLeft className={styles.icon()} />
      <span>Previous</span>
    </PaginationLink>
  )
}

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => {
  const styles = paginationStyles()
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={styles.link({ className })}
      {...props}
    >
      <span>Next</span>
      <Lucide.ChevronRight className={styles.icon()} />
    </PaginationLink>
  )
}

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => {
  const styles = paginationStyles()
  return (
    <span aria-hidden className={styles.ellipsis({ className })} {...props}>
      <Lucide.MoreHorizontal className={styles.icon()} />
      <span className="sr-only">More pages</span>
    </span>
  )
}

Pagination.displayName = 'Pagination'
PaginationContent.displayName = 'PaginationContent'
PaginationItem.displayName = 'PaginationItem'
PaginationLink.displayName = 'PaginationLink'
PaginationPrevious.displayName = 'PaginationPrevious'
PaginationNext.displayName = 'PaginationNext'
PaginationEllipsis.displayName = 'PaginationEllipsis'

export {
  Pagination,
  PaginationContent,
  PaginationLink,
  PaginationItem,
  PaginationPrevious,
  PaginationNext,
  PaginationEllipsis,
}
