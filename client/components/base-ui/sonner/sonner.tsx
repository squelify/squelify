import { Toaster as Sonner } from 'sonner'
import { useTheme } from '#/context/hooks/use-theme'
import {
  toastActionButtonStyles,
  toastCancelButtonStyles,
  toastDescriptionStyles,
  toastStyles,
} from './sonner.css'

type ToasterProps = React.ComponentProps<typeof Sonner>

const Toaster = ({ ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: toastStyles(),
          description: toastDescriptionStyles(),
          actionButton: toastActionButtonStyles(),
          cancelButton: toastCancelButtonStyles(),
        },
      }}
      {...props}
    />
  )
}

export { Toaster }
