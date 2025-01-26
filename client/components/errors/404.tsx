import { useNavigate } from 'react-router'
import { Link } from '#/components/base-ui'
import { errorStyles } from './error.css'

export default function NotFound() {
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
      <div className={errorStyles.decorativeCode}>
        <h2 className={errorStyles.decorativeText}>404</h2>
      </div>
      <div className={errorStyles.content}>
        <div className={errorStyles.container}>
          <p className={errorStyles.errorCode}>404</p>
          <h1 className={errorStyles.title}>Page not found</h1>
          <p className={errorStyles.description}>
            Sorry, we couldn't find the page you're looking for.
          </p>
          <div className={errorStyles.actions}>
            <button type="button" onClick={handleBack} className={errorStyles.primaryButton}>
              Go back
            </button>
            <Link
              href="https://squelify.com/docs?utm_source=squelify&utm_medium=404"
              className={errorStyles.secondaryButton}
              newTab
            >
              View Documentation
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
