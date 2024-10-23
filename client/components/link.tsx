import type React from 'react'
import { forwardRef } from 'react'
import { type LinkProps, Link as RouterLink } from 'react-router-dom'
import { clx } from '#/utils/helper'

interface CustomLinkProps extends Omit<LinkProps, 'to'> {
  href: string
  newTab?: boolean
}

/**
 * Custom Link component that wraps React Router's Link component.
 * This component replaces the `to` prop with `href` for consistency with HTML anchor elements.
 *
 * @param props - The properties for the Link component.
 * @param ref - The forwarded ref for the anchor element.
 * @returns A React element that renders a link.
 *
 * Example usage:
 * ```tsx
 * <Link href="/path" className="custom-class">Link Text</Link>
 * ```
 */
const Link = forwardRef(function Component(
  props: CustomLinkProps & React.ComponentPropsWithoutRef<'a'>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const { href, className, newTab, ...rest } = props
  return (
    <RouterLink
      to={href}
      className={clx('text-inherit dark:text-inherit', className)}
      rel={newTab ? 'noopener noreferrer' : undefined}
      target={newTab ? '_blank' : '_self'}
      ref={ref}
      {...rest}
    />
  )
})

export { Link }
