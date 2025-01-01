import { DashIcon } from '@radix-ui/react-icons'
import { OTPInput, OTPInputContext } from 'input-otp'
import * as React from 'react'
import { clx } from '#/utils/helper'
import {
  inputOTPCaretInnerStyles,
  inputOTPCaretStyles,
  inputOTPGroupStyles,
  inputOTPSlotStyles,
  inputOTPStyles,
} from './input-otp.css'

const InputOTP = React.forwardRef<
  React.ComponentRef<typeof OTPInput>,
  React.ComponentPropsWithoutRef<typeof OTPInput>
>(({ className, containerClassName, ...props }, ref) => (
  <OTPInput
    ref={ref}
    containerClassName={clx(inputOTPStyles({ container: true }), containerClassName)}
    className={clx(inputOTPStyles(), className)}
    {...props}
  />
))

const InputOTPGroup = React.forwardRef<
  React.ComponentRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clx(inputOTPGroupStyles(), className)} {...props} />
))

const InputOTPSlot = React.forwardRef<
  React.ComponentRef<'div'>,
  React.ComponentPropsWithoutRef<'div'> & { index: number }
>(({ index, className, ...props }, ref) => {
  const inputOTPContext = React.useContext(OTPInputContext)
  const { char, hasFakeCaret, isActive } = inputOTPContext.slots[index] || {}

  return (
    <div
      ref={ref}
      className={clx(inputOTPSlotStyles(), className)}
      data-active={isActive}
      {...props}
    >
      {char}
      {hasFakeCaret && (
        <div className={inputOTPCaretStyles()}>
          <div className={inputOTPCaretInnerStyles()} />
        </div>
      )}
    </div>
  )
})

const InputOTPSeparator = React.forwardRef<
  React.ComponentRef<'div'>,
  React.ComponentPropsWithoutRef<'div'>
>(({ ...props }, ref) => (
  <div ref={ref} {...props}>
    <DashIcon />
  </div>
))

InputOTP.displayName = 'InputOTP'
InputOTPGroup.displayName = 'InputOTPGroup'
InputOTPSlot.displayName = 'InputOTPSlot'
InputOTPSeparator.displayName = 'InputOTPSeparator'

export { InputOTP, InputOTPGroup, InputOTPSlot, InputOTPSeparator }
