import * as Lucide from 'lucide-react'
import { clx } from '#/utils/helper'
import { errorStyles } from './error.css'

export default function BoundaryError() {
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
    <div className={errorStyles.wrapper}>
      <div className={errorStyles.decorativeGradient}>
        <div className={errorStyles.gradientInner}>
          <div className={errorStyles.gradientBg} />
        </div>
      </div>
      <div className={errorStyles.decorative500}>
        <h2 className={errorStyles.decorativeText}>500</h2>
      </div>
      <div className={errorStyles.content}>
        <div className={clx(errorStyles.container, 'max-w-xl')}>
          <p className={errorStyles.errorCode}>500</p>
          <h1 className={errorStyles.title}>Application Error</h1>
          <p className={errorStyles.description}>
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
          <div className={errorStyles.actions}>
            <button type="button" onClick={handleReload} className={errorStyles.primaryButton}>
              Try again
            </button>
            <button type="button" onClick={handleBack} className={errorStyles.secondaryButton}>
              Go back
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
