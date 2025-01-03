import type { Assign } from '@ark-ui/react'
import { type HTMLArkProps, ark } from '@ark-ui/react/factory'
import * as React from 'react'
import { CardVariants, cardStyles } from './card.css'

export interface CardProps extends Assign<HTMLArkProps<'div'>, CardVariants> {
  asChild?: boolean
}

export const Card = React.forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant, compact, asChild = false, ...props }, ref) => {
    const styles = cardStyles({ variant, compact })
    return <ark.div ref={ref} className={styles.root({ className })} asChild={asChild} {...props} />
  }
)

export const CardHeader = React.forwardRef<HTMLDivElement, HTMLArkProps<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = cardStyles()
    return <ark.div ref={ref} className={styles.header({ className })} {...props} />
  }
)

export const CardTitle = React.forwardRef<HTMLHeadingElement, HTMLArkProps<'h3'>>(
  ({ className, ...props }, ref) => {
    const styles = cardStyles()
    return <ark.h3 ref={ref} className={styles.title({ className })} {...props} />
  }
)

export const CardDescription = React.forwardRef<HTMLParagraphElement, HTMLArkProps<'p'>>(
  ({ className, ...props }, ref) => {
    const styles = cardStyles()
    return <ark.p ref={ref} className={styles.description({ className })} {...props} />
  }
)

export const CardContent = React.forwardRef<HTMLDivElement, HTMLArkProps<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = cardStyles()
    return <ark.div ref={ref} className={styles.content({ className })} {...props} />
  }
)

export const CardFooter = React.forwardRef<HTMLDivElement, HTMLArkProps<'div'>>(
  ({ className, ...props }, ref) => {
    const styles = cardStyles()
    return <ark.div ref={ref} className={styles.footer({ className })} {...props} />
  }
)

Card.displayName = 'Card'
CardHeader.displayName = 'CardHeader'
CardTitle.displayName = 'CardTitle'
CardDescription.displayName = 'CardDescription'
CardContent.displayName = 'CardContent'
CardFooter.displayName = 'CardFooter'
