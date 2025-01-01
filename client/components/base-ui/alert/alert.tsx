import * as React from 'react'
import { clx } from '#/utils/helper'
import {
  type AlertVariants,
  alertDescriptionStyles,
  alertStyles,
  alertTitleStyles,
} from './alert.css'

const Alert = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement> & AlertVariants
>(({ className, variant, ...props }, ref) => (
  <div ref={ref} role="alert" className={clx(alertStyles({ variant }), className)} {...props} />
))

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => (
    <h5 ref={ref} className={clx(alertTitleStyles(), className)} {...props} />
  )
)

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => (
  <div ref={ref} className={clx(alertDescriptionStyles(), className)} {...props} />
))

Alert.displayName = 'Alert'
AlertTitle.displayName = 'AlertTitle'
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
