import { OTPInput, OTPInputContext } from 'input-otp'
import * as Lucide from 'lucide-react'
import * as React from 'react'
import { inputOTPStyles } from './input-otp.css'
import type { InputOTPVariants } from './input-otp.css'

type InputOTPProps = React.ComponentPropsWithoutRef<typeof OTPInput> & InputOTPVariants

const InputOTP = React.forwardRef<React.ComponentRef<typeof OTPInput>, InputOTPProps>(
  ({ className, containerClassName, size, ...props }, ref) => {
    const styles = inputOTPStyles({ size })
    return (
      <OTPInput
        ref={ref}
        containerClassName={styles.container({ className: containerClassName })}
        className={styles.root({ className })}
        {...props}
      />
    )
  }
)

const InputOTPGroup = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = inputOTPStyles()
    return <div ref={ref} className={styles.group({ className })} {...props} />
  }
)

const InputOTPSlot = React.forwardRef<
  HTMLDivElement,
  React.ComponentPropsWithoutRef<'div'> & { index: number } & InputOTPVariants
>(({ index, className, size, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] || {}
  const styles = inputOTPStyles({ size })

  return (
    <div ref={ref} className={styles.slot({ className })} data-active={isActive} {...props}>
      {char}
      {hasFakeCaret && (
        <div className={styles.caret()}>
          <div className={styles.caretInner()} />
        </div>
      )}
    </div>
  )
})

const InputOTPSeparator = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = inputOTPStyles()
    return (
      <div ref={ref} className={styles.separator({ className })} {...props}>
        <Lucide.Minus strokeWidth={1.6} />
      </div>
    )
  }
)

InputOTP.displayName = 'InputOTP'
InputOTPGroup.displayName = 'InputOTPGroup'
InputOTPSlot.displayName = 'InputOTPSlot'
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
