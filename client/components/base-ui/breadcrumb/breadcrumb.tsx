import { Slot } from '@radix-ui/react-slot'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { breadcrumbStyles } from './breadcrumb.css'
import type { BreadcrumbVariants } from './breadcrumb.css'

interface BreadcrumbProps extends React.ComponentPropsWithoutRef<'nav'>, BreadcrumbVariants {
  separator?: React.ReactNode
}

const Breadcrumb = React.forwardRef<HTMLElement, BreadcrumbProps>(
  ({ size, className, ...props }, ref) => {
    return <nav ref={ref} aria-label="breadcrumb" className={clx(className)} {...props} />
  }
)

const BreadcrumbList = React.forwardRef<HTMLOListElement, React.ComponentPropsWithoutRef<'ol'>>(
  ({ className, ...props }, ref) => {
    const styles = breadcrumbStyles()
    return <ol ref={ref} className={styles.list({ className })} {...props} />
  }
)

const BreadcrumbItem = React.forwardRef<HTMLLIElement, React.ComponentPropsWithoutRef<'li'>>(
  ({ className, ...props }, ref) => {
    const styles = breadcrumbStyles()
    return <li ref={ref} className={styles.item({ className })} {...props} />
  }
)

const BreadcrumbLink = React.forwardRef<
  HTMLAnchorElement,
  React.ComponentPropsWithoutRef<'a'> & { asChild?: boolean }
>(({ asChild, className, ...props }, ref) => {
  const styles = breadcrumbStyles()
  const Comp = asChild ? Slot : 'a'
  return <Comp ref={ref} className={styles.link({ className })} {...props} />
})

const BreadcrumbPage = React.forwardRef<HTMLSpanElement, React.ComponentPropsWithoutRef<'span'>>(
  ({ className, ...props }, ref) => {
    const styles = breadcrumbStyles()
    return (
      <span
        ref={ref}
        aria-current="page"
        aria-disabled="true"
        className={styles.page({ className })}
        {...props}
      />
    )
  }
)

const BreadcrumbSeparator = ({ children, className, ...props }: React.ComponentProps<'span'>) => {
  const styles = breadcrumbStyles()
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={styles.separator({ className })}
      {...props}
    >
      {children ?? <Lucide.ChevronRight className={styles.icon()} strokeWidth={2} />}
    </span>
  )
}

const BreadcrumbEllipsis = ({ className, ...props }: React.ComponentProps<'span'>) => {
  const styles = breadcrumbStyles()
  return (
    <span
      role="presentation"
      aria-hidden="true"
      className={styles.ellipsis({ className })}
      {...props}
    >
      <Lucide.Ellipsis className={styles.icon()} strokeWidth={2} />
      <span className="sr-only">More</span>
    </span>
  )
}

Breadcrumb.displayName = 'Breadcrumb'
BreadcrumbList.displayName = 'BreadcrumbList'
BreadcrumbItem.displayName = 'BreadcrumbItem'
BreadcrumbLink.displayName = 'BreadcrumbLink'
BreadcrumbPage.displayName = 'BreadcrumbPage'
BreadcrumbSeparator.displayName = 'BreadcrumbSeparator'
BreadcrumbEllipsis.displayName = 'BreadcrumbElipssis'

export {
  Breadcrumb,
  BreadcrumbList,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbPage,
  BreadcrumbSeparator,
  BreadcrumbEllipsis,
}
