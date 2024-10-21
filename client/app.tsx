import { useState } from 'react'

export default function App() {
  const [count, setCount] = useState(0)

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-sm rounded-lg bg-white p-8 shadow">
        <h1 className="mb-6 text-center font-bold text-3xl text-gray-800">Nitro Start</h1>
        <div className="mb-6">
          <button
            type="button"
            className="w-full rounded bg-blue-500 px-4 py-2 font-semibold text-white transition duration-300 ease-in-out hover:bg-blue-600"
            onClick={() => setCount((count) => count + 1)}
          >
            Count: {count}
          </button>
        </div>
        <p className="mb-4 text-center text-gray-600">See an example API route below</p>
        <a href="/api" className="block text-center font-medium text-blue-500 hover:text-blue-600">
          See API Routes
        </a>
      </div>
    </div>
  )
}
