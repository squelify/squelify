import { Toaster as Sonner } from 'sonner'
import { useTheme } from '#/context/hooks/use-theme'
import { sonnerStyles } from './sonner.css'
import type { SonnerVariants } from './sonner.css'

type ToasterProps = React.ComponentProps<typeof Sonner> & SonnerVariants

const Toaster = ({ variant, ...props }: ToasterProps) => {
  const { theme = 'system' } = useTheme()
  const styles = sonnerStyles({ variant })

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

export { Toaster }
