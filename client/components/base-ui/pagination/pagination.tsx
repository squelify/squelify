import * as Lucide from 'lucide-react'
import * as React from 'react'
import { Link } from '#/components/link'
import { clx } from '#/utils/helper'
import { ButtonProps } from '../button/button'
import { buttonStyles } from '../button/button.css'
import {
  paginationContentStyles,
  paginationEllipsisStyles,
  paginationItemStyles,
  paginationLinkStyles,
  paginationStyles,
} from './pagination.css'

const Pagination = ({ className, ...props }: React.ComponentProps<'nav'>) => (
  <nav aria-label="pagination" className={clx(paginationStyles(), className)} {...props} />
)

const PaginationContent = React.forwardRef<HTMLUListElement, React.ComponentProps<'ul'>>(
  ({ className, ...props }, ref) => (
    <ul ref={ref} className={clx(paginationContentStyles(), className)} {...props} />
  )
)

const PaginationItem = React.forwardRef<HTMLLIElement, React.ComponentProps<'li'>>(
  ({ className, ...props }, ref) => (
    <li ref={ref} className={clx(paginationItemStyles(), className)} {...props} />
  )
)

type PaginationLinkProps = {
  isActive?: boolean
} & Pick<ButtonProps, 'size'> &
  React.ComponentProps<'a'>

const PaginationLink = ({ className, isActive, size = 'icon', ...props }: PaginationLinkProps) => (
  <Link
    href={props.href || '#'}
    aria-current={isActive ? 'page' : undefined}
    className={clx(
      buttonStyles({
        variant: isActive ? 'outline' : 'ghost',
        size,
      }),
      className
    )}
    {...props}
  />
)

const PaginationPrevious = ({
  className,
  ...props
}: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to previous page"
    size="default"
    className={clx(paginationLinkStyles({ direction: 'previous' }), className)}
    {...props}
  >
    <Lucide.ChevronLeft className="size-4" />
    <span>Previous</span>
  </PaginationLink>
)

const PaginationNext = ({ className, ...props }: React.ComponentProps<typeof PaginationLink>) => (
  <PaginationLink
    aria-label="Go to next page"
    size="default"
    className={clx(paginationLinkStyles({ direction: 'next' }), className)}
    {...props}
  >
    <span>Next</span>
    <Lucide.ChevronRight className="size-4" />
  </PaginationLink>
)

const PaginationEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => (
  <span aria-hidden className={clx(paginationEllipsisStyles(), className)} {...props}>
    <Lucide.MoreHorizontal className="size-4" />
    <span className="sr-only">More pages</span>
  </span>
)

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
