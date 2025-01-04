import * as React from 'react'
import { forwardRef } from 'react'
import { Link as RouterLink } from 'react-router'
import type { LinkProps as RouterLinkProps } from 'react-router'
import { clx } from '#/utils/helper'

/**
 * Props for the custom Link component extending React Router's LinkProps
 * @property href - The URL the link points to (replaces 'to' prop)
 * @property newTab - Whether to open link in new tab
 * @property underline - Whether to show underline decoration
 * @property disabled - Whether the link is disabled
 */
interface LinkProps extends Omit<RouterLinkProps, 'to'> {
  href: string
  newTab?: boolean
  underline?: boolean
  disabled?: boolean
}

/**
 * Custom Link component that wraps React Router's Link component.
 * Provides consistent HTML-like API and additional features like new tab opening,
 * underline styling, and disabled state.
 *
 * @param props - The properties for the Link component
 * @param ref - The forwarded ref for the anchor element
 * @returns A React element that renders an enhanced link
 *
 * Example usage:
 * ```tsx
 * <Link href="/dashboard" newTab underline>
 *   Go to Dashboard
 * </Link>
 *
 * <Link href="/settings" disabled>
 *   Settings
 * </Link>
 * ```
 */
const Link = forwardRef(function Component(
  props: LinkProps & React.RefAttributes<HTMLAnchorElement>,
  ref: React.ForwardedRef<HTMLAnchorElement>
) {
  const { href, className, newTab, underline = false, disabled = false, onClick, ...rest } = props

  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (disabled) {
      e.preventDefault()
      return
    }
    onClick?.(e)
  }

  return (
    <RouterLink
      to={href}
      className={clx(
        'text-inherit transition-colors duration-200 dark:text-inherit',
        underline && 'hover:underline',
        disabled && 'pointer-events-none cursor-not-allowed opacity-50',
        className
      )}
      rel={newTab ? 'noopener noreferrer' : undefined}
      target={newTab ? '_blank' : undefined}
      onClick={handleClick}
      ref={ref}
      {...rest}
    />
  )
})

export { Link }
