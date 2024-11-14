import { useState } from 'react'
import { useOutletContext } from 'react-router-dom'
import { useSEOMeta } from '#/context/hooks/use-seo-meta'
import type { AppContextType } from '#/providers/app-provider'

export default function Component() {
  useSEOMeta('Dashboard')

  const ctx = useOutletContext<AppContextType>()
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center font-bold text-3xl text-gray-800">
          Hello {ctx.user?.firstName}!
        </h1>
        <div className="mb-6">
          <button
            type="button"
            className="w-full rounded bg-brand-500 px-4 py-2 font-semibold text-white transition duration-300 ease-in-out hover:bg-brand-600"
            onClick={() => setCount((count) => count + 1)}
          >
            Count: {count}
          </button>
        </div>
        <div className="inline-flex w-full items-center justify-center">
          <button
            type="button"
            className="block text-center font-medium text-brand-500 hover:text-brand-600"
            onClick={() => ctx.logout()}
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  )
}

// Give it a meaningful name for debugging purposes.
Component.displayName = 'DashboardPage'
