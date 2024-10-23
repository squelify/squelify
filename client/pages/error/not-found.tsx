import { Link } from '#/components/link'

export default function NotFound() {
  return (
    <div className="mx-auto flex size-full min-h-screen max-w-2xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
      <h1 className="block font-bold text-4xl text-gray-800 sm:text-5xl lg:text-6xl dark:text-white">
        404 Not found
      </h1>
      <div className="mt-8 text-gray-600 text-lg sm:mt-10 dark:text-gray-300">
        <p className="leading-8">
          Sorry, we can&apos;t find that page. <br className="block md:hidden" /> Check that you
          typed the address correctly, or try using our site search to find something specific.
        </p>
      </div>
      <div className="mt-8 flex flex-col items-center justify-center lg:mt-14">
        <Link
          href="/"
          className="inline-flex w-full items-center justify-center gap-2 rounded-md border border-transparent px-3 py-2 font-semibold text-primary-500 ring-offset-white transition-all hover:text-primary-700 focus:outline-none focus:ring-1 focus:ring-primary-500 focus:ring-offset-2 sm:w-auto dark:ring-offset-gray-900"
        >
          <svg className="size-2.5" width={20} height={20} viewBox="0 0 16 16" fill="none">
            <path
              d="M11.2792 1.64001L5.63273 7.28646C5.43747 7.48172 5.43747 7.79831 5.63273 7.99357L11.2792 13.64"
              stroke="currentColor"
              strokeWidth="{2}"
              strokeLinecap="round"
            />
          </svg>
          Back to main page
        </Link>
      </div>
    </div>
  )
}
