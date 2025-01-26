import { useNavigate } from 'react-router'
import { Link } from '#/components/base-ui'
import { errorStyles } from './error.css'

interface InternalErrorProps {
  error?: Error
}

export default function InternalError({ error }: InternalErrorProps) {
  const navigate = useNavigate()
  const styles = errorStyles()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
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
        <div className={styles.container()}>
          <p className={styles.errorCode()}>500</p>
          <h1 className={styles.title()}>Internal Server Error</h1>
          <p className={styles.description()}>
            {error instanceof Error
              ? error.message
              : 'Something went wrong on our end. Please try again later.'}
          </p>
          <div className={styles.actions()}>
            <button type="button" onClick={handleBack} className={styles.primaryButton()}>
              Go back
            </button>
            <Link href="/docs/troubleshooting" className={styles.secondaryButton()}>
              Troubleshooting Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
