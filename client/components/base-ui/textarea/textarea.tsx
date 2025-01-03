import * as React from 'react'
import { textareaStyles } from './textarea.css'

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {}

const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return <textarea className={textareaStyles({ className })} ref={ref} {...props} />
  }
)

Textarea.displayName = 'Textarea'

export { Textarea }
