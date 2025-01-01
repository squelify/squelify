import * as Lucide from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { clx } from '#/utils/helper'
import { Button } from '../button/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip/tooltip'
import { type InputVariants, iconButtonStyles, inputStyles } from './input.css'

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement>, InputVariants {
  onCopy?: () => void
  showCopyButton?: boolean
  showExternalCopyButton?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, showCopyButton, showExternalCopyButton, onCopy, value = '', ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)

    const togglePassword = () => {
      setShowPassword(!showPassword)
    }

    const handleCopy = () => {
      if (!value) {
        toast.error('Nothing to copy')
        return
      }
      navigator.clipboard.writeText(value.toString())
      toast.success('Copied to clipboard')
      onCopy?.()
    }

    const PasswordToggle = () => (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" onClick={togglePassword} className={iconButtonStyles()}>
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
            <button type="button" onClick={handleCopy} className={iconButtonStyles()}>
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
                inputStyles({
                  hasRightIcon: type === 'password',
                }),
                className
              )}
              value={value}
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
            inputStyles({
              hasRightIcon: type === 'password' || showCopyButton,
            }),
            className
          )}
          value={value}
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
