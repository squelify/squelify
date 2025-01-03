import { Toaster as Sonner } from 'sonner'
import { toast } from 'sonner'
import { useTheme } from '#/context/hooks/use-theme'
import { type ToastVariants, toastStyles } from './toast.css'

type ToasterProps = React.ComponentProps<typeof Sonner> & ToastVariants

const Toaster = ({ variant, className, ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const styles = toastStyles({ variant, className })

  return (
    <Sonner
      theme={theme as ToasterProps['theme']}
      className="toaster group"
      toastOptions={{
        classNames: {
          toast: styles.toast(),
          description: styles.description(),
          actionButton: styles.actionButton(),
          cancelButton: styles.cancelButton(),
          title: styles.title(),
          loader: styles.loader(),
          closeButton: styles.closeButton(),
        },
      }}
      {...props}
    />
  )
}

export { Toaster, toast }
