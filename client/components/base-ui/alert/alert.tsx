import { type Assign } from '@ark-ui/react'
import { type HTMLArkProps, ark } from '@ark-ui/react/factory'
import * as React from 'react'
import { clx } from '#/utils/helper'
import { Text } from '../text/text'
import { type AlertVariants, alertStyles } from './alert.css'

export interface AlertProps extends Assign<HTMLArkProps<'div'>, AlertVariants> {}
export interface AlertContentProps extends Assign<HTMLArkProps<'div'>, AlertVariants> {}
export interface AlertTitleProps extends Assign<HTMLArkProps<'h5'>, AlertVariants> {}
export interface AlertDescriptionProps extends Assign<HTMLArkProps<'div'>, AlertVariants> {}
export interface AlertIconProps extends Assign<HTMLArkProps<'span'>, AlertVariants> {}
export interface AlertActionProps extends Assign<HTMLArkProps<'div'>, AlertVariants> {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, ...props }, ref) => {
    const styles = alertStyles({ variant })
    return <ark.div ref={ref} className={clx(styles.root(), className)} {...props} />
  }
)

const AlertContent = React.forwardRef<HTMLDivElement, AlertContentProps>(
  ({ className, variant, ...props }, ref) => {
    const styles = alertStyles({ variant })
    return <ark.div ref={ref} className={clx(styles.content(), className)} {...props} />
  }
)

const AlertTitle = React.forwardRef<HTMLHeadingElement, AlertTitleProps>(
  ({ className, variant, ...props }, ref) => {
    const styles = alertStyles({ variant })
    return <Text ref={ref} weight="medium" className={clx(styles.title(), className)} {...props} />
  }
)

const AlertDescription = React.forwardRef<HTMLDivElement, AlertDescriptionProps>(
  ({ className, variant, ...props }, ref) => {
    const styles = alertStyles({ variant })
    return <Text ref={ref} className={clx(styles.description(), className)} {...props} />
  }
)

const AlertIcon = React.forwardRef<HTMLSpanElement, AlertIconProps>(
  ({ className, variant, ...props }, ref) => {
    const styles = alertStyles({ variant })
    return <ark.span ref={ref} className={clx(styles.icon(), className)} {...props} />
  }
)

const AlertAction = React.forwardRef<HTMLDivElement, AlertActionProps>(
  ({ className, variant, ...props }, ref) => {
    const styles = alertStyles({ variant })
    return <ark.div ref={ref} className={clx(styles.action(), className)} {...props} />
  }
)

Alert.displayName = 'Alert'
AlertContent.displayName = 'AlertContent'
AlertTitle.displayName = 'AlertTitle'
AlertDescription.displayName = 'AlertDescription'
AlertIcon.displayName = 'AlertIcon'
AlertAction.displayName = 'AlertAction'

export { Alert, AlertContent, AlertTitle, AlertDescription, AlertIcon, AlertAction }
