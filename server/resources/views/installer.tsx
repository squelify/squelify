import * as Lucide from 'lucide-react'

export default function Page() {
  const errorMessage = null

  return (
    <main className="installer-container">
      <div className="installer-wrapper">
        <div className="installer-header">
          <img src="/favicon.svg" className="installer-logo" alt="Squelify" />
          <h1 className="installer-title">Welcome to Squelify</h1>
          <p className="installer-subtitle">Let's set up your administrator account</p>
          {errorMessage && (
            <div className="installer-error-wrapper">
              <div className="installer-error-container">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <Lucide.BadgeInfo className="installer-error-icon" />
                  </div>
                  <div className="ml-3">
                    <p className="installer-error-text">{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="installer-form-container">
          <form method="POST" action="/installer" className="space-y-4">
            <div className="installer-form-section">
              <h2 className="installer-title">Create Admin Account</h2>
              <div className="installer-grid-container">
                <div>
                  <label htmlFor="firstName" className="installer-label">
                    First Name
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    minLength={2}
                    maxLength={50}
                    pattern="[A-Za-z\s]+"
                    placeholder="Admin"
                    title="First name should only contain letters and spaces"
                    className="installer-input"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="installer-label">
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    minLength={2}
                    maxLength={50}
                    pattern="[A-Za-z\s]+"
                    placeholder="System"
                    title="Last name should only contain letters and spaces"
                    className="installer-input"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="installer-label">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  placeholder="admin@example.com"
                  title="Please enter a valid email address"
                  className="installer-input"
                />
              </div>

              <div>
                <label htmlFor="password" className="installer-label">
                  Password
                </label>
                <div className="installer-password-container">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    minLength={8}
                    placeholder="Enter your secure password"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
                    title="Password must contain at least 8 characters, including uppercase, lowercase, number and special character"
                    className="installer-input"
                  />
                  <button
                    type="button"
                    className="installer-password-toggle"
                    onClick={() => console.info('Show password')}
                    tabIndex={-1}
                  >
                    <Lucide.Eye className="size-5" />
                  </button>
                </div>
                <p className="installer-password-hint">
                  Min 8 characters with 1 uppercase, 1 lowercase, 1 number &amp; 1 special character
                  (!@#$%^&amp;*)
                </p>
              </div>
            </div>

            <div className="installer-divider">
              <h2 className="installer-title">Application Settings</h2>
              <div>
                <label htmlFor="appName" className="installer-label">
                  Application Name
                </label>
                <input
                  type="text"
                  id="appName"
                  name="appName"
                  required
                  minLength={4}
                  maxLength={50}
                  placeholder="My Awesome App"
                  pattern="[A-Za-z0-9\s\-_]+"
                  title="Application name can only contain letters, numbers, spaces, hyphens and underscores"
                  className="installer-input"
                />
              </div>
            </div>

            <div className="installer-checkbox-group">
              <div className="installer-checkbox-wrapper">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  className="installer-checkbox"
                />
              </div>
              <div className="ml-2">
                <label htmlFor="newsletter" className="installer-checkbox-label">
                  Keep me updated about new features &amp; upcoming improvements.{' '}
                  <br className="hidden sm:inline-block" />
                  By doing this you accept the{' '}
                  <a
                    href="https://squelify.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="installer-link"
                  >
                    <span>Terms</span>
                    <Lucide.ExternalLink className="installer-external-icon" />
                  </a>
                  {' and the '}
                  <a
                    href="https://squelify.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="installer-link"
                  >
                    <span>Privacy Policy</span>
                    <Lucide.ExternalLink className="installer-external-icon" />
                  </a>
                  .
                </label>
              </div>
            </div>

            <div className="installer-submit-container">
              <button
                type="submit"
                id="submitBtn"
                className="installer-submit-button"
                disabled={false}
              >
                Complete Installation
              </button>
            </div>
          </form>
        </div>

        <div className="installer-footer">
          Need help? Check out our{' '}
          <a
            href="https://squelify.com/docs"
            className="installer-link"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>documentation</span>
            <Lucide.ExternalLink className="installer-external-icon" />
          </a>
        </div>
      </div>
    </main>
  )
}
