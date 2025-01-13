import { useNavigate } from 'react-router'
import { Link } from '#/components/base-ui'
import { errorStyles } from './error.css'

interface InternalErrorProps {
  error?: Error
}

export default function InternalError({ error }: InternalErrorProps) {
  const navigate = useNavigate()

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1)
    } else {
      navigate('/')
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
        <div className={errorStyles.container}>
          <p className={errorStyles.errorCode}>500</p>
          <h1 className={errorStyles.title}>Internal Server Error</h1>
          <p className={errorStyles.description}>
            {error instanceof Error
              ? error.message
              : 'Something went wrong on our end. Please try again later.'}
          </p>
          <div className={errorStyles.actions}>
            <button type="button" onClick={handleBack} className={errorStyles.primaryButton}>
              Go back
            </button>
            <Link href="/docs/troubleshooting" className={errorStyles.secondaryButton}>
              Troubleshooting Guide
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
