import * as Lucide from 'lucide-react'
import React from 'react'
import { toast } from 'sonner'
import { clx } from '#/utils/helper'
import { Button } from '../button/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip/tooltip'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  onCopy?: () => void
  showCopyButton?: boolean
  showExternalCopyButton?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, showCopyButton, showExternalCopyButton, onCopy, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePassword = () => {
      setShowPassword(!showPassword)
    }

    const handleCopy = () => {
      if (!props.value) {
        toast.error('Nothing to copy')
        return
      }
      navigator.clipboard.writeText(props.value.toString())
      toast.success('Copied to clipboard')
      onCopy?.()
    }

    const PasswordToggle = () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
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
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>{showPassword ? 'Hide password' : 'Show password'}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const CopyButton = () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button
              type="button"
              onClick={handleCopy}
              className={clx(
                '-translate-y-1/2 absolute top-1/2 right-3',
                'text-muted-foreground/60 hover:text-muted-foreground',
                'transition-colors duration-200'
              )}
            >
              <Lucide.Copy className="size-4" strokeWidth={2} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    const ExternalCopyButton = () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={handleCopy}
              className="shrink-0"
            >
              <Lucide.Copy className="size-4" strokeWidth={2} />
            </Button>
          </TooltipTrigger>
          <TooltipContent side="top">
            <p>Copy to clipboard</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    )

    if (showExternalCopyButton) {
      return (
        <div className="flex gap-2">
          <div className="relative flex-1">
            <input
              type={showPassword ? 'text' : type}
              className={clx(
                'flex h-9 w-full rounded-md border border-input bg-transparent',
                'px-3 py-1 text-sm shadow-sm transition-colors',
                'file:border-0 file:bg-transparent file:text-sm',
                'file:font-medium file:text-foreground',
                'placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-1',
                'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-primary/50',
                'disabled:cursor-not-allowed disabled:opacity-50',
                type === 'password' && 'pr-10',
                className
              )}
              ref={ref}
              {...props}
            />
            {type === 'password' && <PasswordToggle />}
          </div>
          <ExternalCopyButton />
        </div>
      )
    }

    return (
      <div className="relative">
        <input
          type={showPassword ? 'text' : type}
          className={clx(
            'flex h-9 w-full rounded-md border border-input bg-transparent',
            'px-3 py-1 text-sm shadow-sm transition-colors',
            'file:border-0 file:bg-transparent file:text-sm',
            'file:font-medium file:text-foreground',
            'placeholder:text-muted-foreground/60 focus:ring-0 focus-visible:ring-1',
            'focus-visible:border-primary focus-visible:outline-none focus-visible:ring-primary/50',
            'disabled:cursor-not-allowed disabled:opacity-50',
            (type === 'password' || showCopyButton) && 'pr-10',
            className
          )}
          ref={ref}
          {...props}
        />
        {type === 'password' && <PasswordToggle />}
        {showCopyButton && !type && <CopyButton />}
      </div>
    )
  }
)

Input.displayName = 'Input'

export { Input }
