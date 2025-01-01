import * as React from 'react'
import { type AlertVariants, alertStyles } from './alert.css'

interface AlertProps extends React.HTMLAttributes<HTMLDivElement>, AlertVariants {}

const Alert = React.forwardRef<HTMLDivElement, AlertProps>(
  ({ className, variant, children, ...props }, ref) => {
    const styles = alertStyles({ variant })
    return (
      <div ref={ref} role="alert" className={styles.root({ className })} {...props}>
        {children}
      </div>
    )
  }
)

const AlertTitle = React.forwardRef<HTMLParagraphElement, React.HTMLAttributes<HTMLHeadingElement>>(
  ({ className, ...props }, ref) => {
    const styles = alertStyles()
    return <h5 ref={ref} className={styles.title({ className })} {...props} />
  }
)

const AlertDescription = React.forwardRef<
  HTMLParagraphElement,
  React.HTMLAttributes<HTMLParagraphElement>
>(({ className, ...props }, ref) => {
  const styles = alertStyles()
  return <div ref={ref} className={styles.description({ className })} {...props} />
})

Alert.displayName = 'Alert'
AlertTitle.displayName = 'AlertTitle'
AlertDescription.displayName = 'AlertDescription'

export { Alert, AlertTitle, AlertDescription }
