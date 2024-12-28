import * as Lucide from 'lucide-react'

export default function Page() {
  const errorMessage = null

  return (
    <main className="min-h-screen bg-neutral-50 dark:bg-neutral-900">
      <div className="mx-auto max-w-xl px-4 py-12">
        <div className="mb-8 text-center">
          <img src="/favicon.svg" alt="Squelify Logo" className="mx-auto mb-4 h-20 w-20" />
          <h1 className="font-bold text-3xl text-neutral-900 dark:text-white">
            Welcome to Squelify
          </h1>
          <p className="mt-2 text-neutral-600 dark:text-neutral-400">
            Let's set up your administrator account
          </p>
          {errorMessage && (
            <div className="-mb-4 mt-6">
              <div className="rounded-[0.3rem] bg-red-50 p-4 dark:bg-red-900/50">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg
                      className="size-5 text-red-400 dark:text-red-500"
                      viewBox="0 0 20 20"
                      fill="currentColor"
                    >
                      <path
                        fillRule="evenodd"
                        d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.28 7.22a.75.75 0 00-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 101.06 1.06L10 11.06l1.72 1.72a.75.75 0 101.06-1.06L11.06 10l1.72-1.72a.75.75 0 00-1.06-1.06L10 8.94 8.28 7.22z"
                        clipRule="evenodd"
                      />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="font-medium text-red-800 text-sm dark:text-red-200">
                      {errorMessage}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        <div className="rounded-[0.3rem] bg-white p-8 shadow dark:bg-neutral-800">
          <form method="POST" action="/installer" className="space-y-4">
            {/* Admin Account */}
            <div className="space-y-3">
              <h2 className="font-semibold text-neutral-900 text-xl dark:text-white">
                Create Admin Account
              </h2>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="firstName"
                    className="block font-medium text-neutral-700 text-sm dark:text-neutral-300"
                  >
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
                    className="mt-0.5 block w-full rounded-[0.3rem] border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:ring-yellow-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
                  />
                  <p className="error-message mt-1 hidden text-red-600 text-sm dark:text-red-400" />
                </div>
                <div>
                  <label
                    htmlFor="lastName"
                    className="block font-medium text-neutral-700 text-sm dark:text-neutral-300"
                  >
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
                    className="mt-0.5 block w-full rounded-[0.3rem] border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:ring-yellow-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
                  />
                  <p className="error-message mt-1 hidden text-red-600 text-sm dark:text-red-400" />
                </div>
              </div>
              <div>
                <label
                  htmlFor="email"
                  className="block font-medium text-neutral-700 text-sm dark:text-neutral-300"
                >
                  Email
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  pattern="[a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,}$"
                  placeholder="admin@example.com"
                  title="Please enter a valid email address"
                  className="mt-0.5 block w-full rounded-[0.3rem] border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:ring-yellow-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
                />
                <p className="error-message mt-1 hidden text-red-600 text-sm dark:text-red-400" />
              </div>
              <div>
                <label
                  htmlFor="password"
                  className="block font-medium text-neutral-700 text-sm dark:text-neutral-300"
                >
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
                    className="mt-0.5 block w-full rounded-[0.3rem] border border-neutral-300 bg-white px-3 py-2 pr-10 text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:ring-yellow-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
                  />
                  <button
                    type="button"
                    className="absolute inset-y-0 right-0 mt-0.5 flex cursor-pointer items-center px-3 text-neutral-500 dark:text-neutral-400"
                    onClick={() => console.info('Show password')}
                    tabIndex={-1}
                  >
                    <Lucide.Eye className="size-5" />
                  </button>
                </div>
                <p className="mt-1 px-0.5 text-neutral-500 text-sm dark:text-neutral-400">
                  Min 8 characters with 1 uppercase, 1 lowercase, 1 number &amp; 1 special character
                  (!@#$%^&amp;*)
                </p>
              </div>
            </div>
            {/* Application Settings */}
            <div className="space-y-3 border-neutral-200 border-t pt-4 dark:border-neutral-700">
              <h2 className="font-semibold text-neutral-900 text-xl dark:text-white">
                Application Settings
              </h2>
              <div>
                <label
                  htmlFor="appName"
                  className="block font-medium text-neutral-700 text-sm dark:text-neutral-300"
                >
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
                  className="mt-0.5 block w-full rounded-[0.3rem] border border-neutral-300 bg-white px-3 py-2 text-neutral-900 placeholder-neutral-400 focus:border-yellow-500 focus:ring-yellow-500 dark:border-neutral-600 dark:bg-neutral-700 dark:text-white dark:placeholder-neutral-500"
                />
                <p className="error-message mt-1 hidden text-red-600 text-sm dark:text-red-400" />
              </div>
            </div>
            {/* Newsletter Opt-in */}
            <div className="flex items-start py-1">
              <div className="mt-1.5 flex h-5 items-center">
                <input
                  id="newsletter"
                  name="newsletter"
                  type="checkbox"
                  className="size-4 rounded-[0.3rem] border-gray-300 text-yellow-500 focus:ring-yellow-500 dark:border-gray-600 dark:bg-gray-700"
                />
              </div>
              <div className="ml-2">
                <label htmlFor="newsletter" className="text-gray-700 text-sm dark:text-gray-300">
                  Keep me updated about new features &amp; upcoming improvements.{' '}
                  <br className="hidden sm:inline-block" />
                  By doing this you accept the{' '}
                  <a
                    href="https://squelify.com/terms"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-yellow-600 hover:underline dark:text-yellow-400"
                  >
                    <span>Terms</span>
                    <Lucide.ExternalLink className="ml-0.5 size-3.5" />
                  </a>
                  {' and the '}
                  <a
                    href="https://squelify.com/privacy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center text-yellow-600 hover:underline dark:text-yellow-400"
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
                className="w-full rounded-[0.3rem] bg-yellow-500 px-4 py-2 text-white focus:outline-none focus:ring-2 focus:ring-yellow-500 enabled:hover:bg-yellow-600 disabled:cursor-not-allowed disabled:opacity-50 dark:bg-yellow-600 enabled:dark:hover:bg-yellow-700"
                disabled={false}
              >
                Complete Installation
              </button>
            </div>
          </form>
        </div>
        <div className="mt-8 text-center text-gray-500 text-sm dark:text-gray-400">
          Need help? Check out our{' '}
          <a
            href="https://squelify.com/docs"
            className="inline-flex items-center text-yellow-600 hover:underline dark:text-yellow-400"
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
