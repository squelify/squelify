import type { Assign } from '@ark-ui/react'
import { type HTMLArkProps, ark } from '@ark-ui/react/factory'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { type ButtonVariants, buttonStyles } from './button.css'

export interface ButtonProps extends Assign<HTMLArkProps<'button'>, ButtonVariants> {
  asChild?: boolean
  isLoading?: boolean
  loadingText?: React.ReactNode
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      variant,
      size,
      className,
      isLoading,
      loadingText,
      disabled,
      children,
      asChild = false,
      ...props
    },
    ref
  ) => {
    const isDisabled = disabled || isLoading

    return (
      <ark.button
        ref={ref}
        className={buttonStyles({ variant, size, isLoading, className })}
        disabled={isDisabled}
        asChild={asChild}
        {...props}
      >
        {isLoading && !loadingText ? (
          <>
            <Lucide.Loader2 strokeWidth={2} />
            <span className="opacity-0">{children}</span>
          </>
        ) : loadingText ? (
          loadingText
        ) : (
          children
        )}
      </ark.button>
    )
  }
)

Button.displayName = 'Button'
