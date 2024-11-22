import * as Lucide from 'lucide-react'
import * as React from 'react'
import { clx } from '#/utils/helper'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePassword = () => {
      setShowPassword(!showPassword)
    }

    return (
      <div className="relative">
        <input
          type={showPassword ? 'text' : type}
          className={clx(
            // Base styles
            'flex h-9 w-full rounded-md border border-input bg-transparent',
            'px-3 py-1 text-sm shadow-sm transition-colors',

            // File input styles
            'file:border-0 file:bg-transparent file:text-sm',
            'file:font-medium file:text-foreground',

            // States
            'placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-1',
            'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-primary/50',
            'disabled:cursor-not-allowed disabled:opacity-50',

            // Password type specific
            type === 'password' && 'pr-10',

            // Custom classes
            className
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && (
          <button
            type="button"
            onClick={togglePassword}
            className={clx(
              '-translate-y-1/2 absolute top-1/2 right-3',
              'text-muted-foreground/60 hover:text-muted-foreground',
              'transition-colors duration-200'
            )}
          >
            {showPassword ? (
              <Lucide.EyeOff className="size-4" strokeWidth={2} />
            ) : (
              <Lucide.Eye className="size-4" strokeWidth={2} />
            )}
          </button>
        )}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
