import * as Lucide from 'lucide-react'

export default function Page() {
  const errorMessage = null

  return (
    <main className="min-h-screen bg-background text-foreground">
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-8 text-center">
          <img src="/favicon.svg" className="mx-auto mb-4 size-20" alt="Squelify" />
          <h1 className="font-bold text-2xl text-foreground">Welcome to Squelify</h1>
          <p className="mt-2 text-muted-foreground">Let's set up your administrator account</p>
          {errorMessage && (
            <div className="-mb-4 mt-6">
              <div className="rounded-[0.3rem] bg-error p-4 text-error-foreground">
                <div className="flex">
                  <div className="shrink-0">
                    <Lucide.BadgeInfo className="size-5 text-error" />
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-error-foreground text-sm">{errorMessage}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        <div className="rounded-[0.3rem] bg-card p-8 text-card-foreground shadow">
          <form method="POST" action="/installer" className="space-y-4">
            <div className="space-y-3">
              <h2 className="font-bold text-foreground text-lg">Create Admin Account</h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label htmlFor="firstName" className="block font-medium text-foreground text-sm">
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
                    className="mt-0.5 block w-full rounded-[0.3rem] border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                  />
                </div>
                <div>
                  <label htmlFor="lastName" className="block font-medium text-foreground text-sm">
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
                    className="mt-0.5 block w-full rounded-[0.3rem] border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="email" className="block font-medium text-foreground text-sm">
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  placeholder="admin@example.com"
                  title="Please enter a valid email address"
                  className="mt-0.5 block w-full rounded-[0.3rem] border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                />
              </div>

              <div>
                <label htmlFor="password" className="block font-medium text-foreground text-sm">
                  Password
                </label>
                <div className="relative">
                  <input
                    type="password"
                    name="password"
                    id="password"
                    required
                    minLength={8}
                    placeholder="Enter your secure password"
                    pattern="^(?=.*[a-z])(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#$%^&*])[a-zA-Z0-9!@#$%^&*]{8,}$"
                    title="Password must contain at least 8 characters, including uppercase, lowercase, number and special character"
                    className="mt-0.5 block w-full rounded-[0.3rem] border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 mt-0.5 flex cursor-pointer items-center px-3 text-muted-foreground"
                    onClick={() => console.info('Show password')}
                    tabIndex={-1}
                  >
                    <Lucide.Eye className="size-5" />
                  </button>
                </div>
                <p className="mt-1 px-0.5 text-muted-foreground text-sm">
                  Min 8 characters with 1 uppercase, 1 lowercase, 1 number &amp; 1 special character
                  (!@#$%^&amp;*)
                </p>
              </div>
            </div>

            <div className="space-y-3 border-border border-t pt-4">
              <h2 className="font-bold text-foreground text-lg">Application Settings</h2>
              <div>
                <label htmlFor="appName" className="block font-medium text-foreground text-sm">
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
                  className="mt-0.5 block w-full rounded-[0.3rem] border-border bg-background px-3 py-2 text-foreground placeholder:text-muted-foreground focus:border-ring focus:ring-ring"
                />
              </div>
            </div>

            <div className="flex items-start py-1">
              <div className="mt-1.5 flex h-5 items-center">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  className="size-4 rounded-[0.3rem] border-border text-primary focus:border-ring focus:ring-ring"
                />
              </div>
              <div className="ml-2">
                <label htmlFor="newsletter" className="text-foreground text-sm">
                  Keep me updated about new features &amp; upcoming improvements.{' '}
                  <br className="hidden sm:inline-block" />
                  By doing this you accept the{' '}
                  <a
                    href="https://squelify.com/terms"
                    className="inline-flex items-center text-primary hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Terms</span>
                    <Lucide.ExternalLink className="ml-0.5 size-3.5" />
                  </a>
                  {' and the '}
                  <a
                    href="https://squelify.com/privacy"
                    className="inline-flex items-center text-primary hover:underline"
                    rel="noopener noreferrer"
                    target="_blank"
                  >
                    <span>Privacy Policy</span>
                    <Lucide.ExternalLink className="ml-0.5 size-3.5" />
                  </a>
                  .
                </label>
              </div>
            </div>

            <div className="pt-1">
              <button
                type="submit"
                id="submitBtn"
                className="w-full rounded-[0.3rem] bg-primary px-4 py-2 text-primary-foreground focus:outline-none focus:ring-2 hover:enabled:brightness-90 disabled:cursor-not-allowed disabled:opacity-50"
                disabled={false}
              >
                Complete Installation
              </button>
            </div>
          </form>
        </div>

        <div className="mt-8 text-center text-muted-foreground text-sm">
          Need help? Check out our{' '}
          <a
            href="https://squelify.com/docs"
            className="inline-flex items-center text-primary hover:underline"
            rel="noopener noreferrer"
            target="_blank"
          >
            <span>documentation</span>
            <Lucide.ExternalLink className="ml-0.5 size-3.5" />
          </a>
        </div>
      </div>
    </main>
  )
}
