import * as Lucide from 'lucide-react'
import * as React from 'react'
import { toast } from 'sonner'
import { Button } from '../button/button'
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '../tooltip/tooltip'
import { inputStyles } from './input.css'
import type { InputVariants } from './input.css'

export interface InputProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'>,
    InputVariants {
  onCopy?: () => void
  showCopyButton?: boolean
  showExternalCopyButton?: boolean
}

const Input = React.forwardRef<HTMLInputElement, InputProps>(
  (
    { className, type, showCopyButton, showExternalCopyButton, onCopy, value = '', size, ...props },
    ref
  ) => {
    const [showPassword, setShowPassword] = React.useState(false)
    const styles = inputStyles({
      size,
      hasRightIcon: type === 'password' || showCopyButton,
    })

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
            <button type="button" onClick={togglePassword} className={styles.iconButton()}>
              {showPassword ? (
                <Lucide.EyeOff className={styles.icon()} />
              ) : (
                <Lucide.Eye className={styles.icon()} />
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
            <button type="button" onClick={handleCopy} className={styles.iconButton()}>
              <Lucide.Copy className={styles.icon()} />
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
              <Lucide.Copy className={styles.icon()} />
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
        <div className={styles.container()}>
          <div className={styles.wrapper()}>
            <input
              type={showPassword ? 'text' : type}
              className={styles.input({ className })}
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
      <div className={styles.wrapper()}>
        <input
          type={showPassword ? 'text' : type}
          className={styles.input({ className })}
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
