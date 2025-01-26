import * as Lucide from 'lucide-react'
import { errorStyles } from './error.css'

export default function BoundaryError() {
  const styles = errorStyles()

  const handleReload = () => {
    window.location.reload()
  }

  const handleBack = () => {
    if (window.history.length > 1) {
      window.history.back()
    } else {
      window.location.href = '/'
    }
  }

  return (
    <div className={styles.wrapper()}>
      <div className={styles.decorativeGradient()}>
        <div className={styles.gradientInner()}>
          <div className={styles.gradientBg()} />
        </div>
      </div>
      <div className={styles.decorativeCode()}>
        <h2 className={styles.decorativeText()}>500</h2>
      </div>
      <div className={styles.content()}>
        <div className={styles.container({ className: 'max-w-xl' })}>
          <p className={styles.errorCode()}>500</p>
          <h1 className={styles.title()}>Application Error</h1>
          <p className={styles.description()}>
            An error occurred on the server. For detailed information, please check your browser's
            console (F12) and refer to the{' '}
            <a
              href="/docs/troubleshooting"
              className="underline hover:no-underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              <span>troubleshooting guide</span>
              <Lucide.ExternalLink className="ml-1 inline-block size-3.5" />
            </a>
          </p>
          <div className={styles.actions()}>
            <button type="button" onClick={handleReload} className={styles.primaryButton()}>
              Try again
            </button>
            <button type="button" onClick={handleBack} className={styles.secondaryButton()}>
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
