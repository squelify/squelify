import * as Lucide from 'lucide-react'
import { installerStyles } from './installer.css.ts'

export default function Installer() {
  const styles = installerStyles()
  const errorMessage = null

  return (
    <main className={styles.main()}>
      <div className={styles.container()}>
        <div className={styles.header()}>
          <img src="/favicon.svg" className={styles.logo()} alt="Squelify" />
          <h1 className={styles.title()}>Welcome to Squelify</h1>
          <p className={styles.subtitle()}>Let's set up your administrator account</p>
          {errorMessage && (
            <div className={styles.errorContainer()}>
              <div className={styles.errorBox()}>
                <div className="flex">
                  <div className="shrink-0">
                    <Lucide.BadgeInfo className={styles.errorIcon()} />
                  </div>
                  <div className="ml-3">
                    <p className={styles.errorMessage()}>{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className={styles.card()}>
          <form hx-post="/installer" className="space-y-4">
            <div className={styles.formSection()}>
              <h2 className={styles.sectionTitle()}>Create Admin Account</h2>
              <div className={styles.formGrid()}>
                <div>
                  <label htmlFor="firstName" className={styles.inputLabel()}>
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
                    className={styles.input()}
                  />
                  <span className={styles.validationMessage()} />
                </div>
                <div>
                  <label htmlFor="lastName" className={styles.inputLabel()}>
                    Last Name
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    minLength={2}
                    maxLength={50}
                    pattern="[A-Za-z\s]+"
                    placeholder="Sistem"
                    title="Last name should only contain letters and spaces"
                    className={styles.input()}
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className={styles.inputLabel()}>
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  placeholder="admin@example.com"
                  title="Please enter a valid email address"
                  className={styles.input()}
                />
              </div>

              <div>
                <label htmlFor="password" className={styles.inputLabel()}>
                  Password
                </label>
                <div className={styles.passwordContainer()}>
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    minLength={8}
                    placeholder="Enter your secure password"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
                    title="Password must contain at least 8 characters, including uppercase, lowercase, number and special character"
                    className={styles.input({ className: 'pr-10' })}
                  />
                  <button
                    type="button"
                    className={styles.passwordButton()}
                    onClick={() => console.info('Show password')}
                    tabIndex={-1}
                  >
                    <Lucide.Eye className={styles.linkIcon()} />
                  </button>
                </div>
                <p className={styles.helpText()}>
                  Min 8 characters with 1 uppercase, 1 lowercase, 1 number &amp; 1 special character
                  (!@#$%^&amp;*)
                </p>
              </div>
            </div>

            <div className={styles.divider()} />

            <div className={styles.checkboxContainer()}>
              <div className={styles.checkboxWrapper()}>
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  className={styles.checkbox()}
                />
              </div>
              <div className={styles.checkboxLabel()}>
                <label htmlFor="newsletter" className={styles.inputLabel({ className: 'mt-0.5' })}>
                  Keep me updated about new features &amp; upcoming improvements.{' '}
                  <br className="hidden sm:inline-block" />
                  By doing this you accept the{' '}
                  <a
                    href="https://squelify.com/terms"
                    className={styles.link()}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Terms</span>
                    <Lucide.ExternalLink className={styles.linkIcon()} />
                  </a>
                  {' and the '}
                  <a
                    href="https://squelify.com/privacy"
                    className={styles.link()}
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Privacy Policy</span>
                    <Lucide.ExternalLink className={styles.linkIcon()} />
                  </a>
                  .
                </label>
              </div>
            </div>

            <div className={styles.buttonWrapper()}>
              <button type="submit" id="submitBtn" className={styles.button()} disabled={false}>
                Complete Installation
              </button>
            </div>
          </form>
        </div>

        <div className={styles.footer()}>
          Need help? Check out our{' '}
          <a
            href="https://squelify.com/docs"
            className={styles.link()}
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>documentation</span>
            <Lucide.ExternalLink className={styles.linkIcon()} />
          </a>
        </div>
      </div>
    </main>
  )
}
